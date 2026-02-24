import { BadRequestError } from "../../shared/errors/app-error.js";

// Business logic for metrics operations.
export class MetricsService {
  constructor(metricsRepository, tenantApi, redis) {
    // Dependency is injected for testability and decoupling.
    this.metricsRepository = metricsRepository;
    this.tenantApi = tenantApi;
    this.redis = redis;
  }

  async countMetricsByTenantId(tenantId) {
    const cacheKey = `metrics_count_${tenantId}`;

    if (this.redis) {
      const cachedMetricsCountPerTenant = await this.redis.get(cacheKey);
      if (cachedMetricsCountPerTenant) {
        try {
          return JSON.parse(cachedMetricsCountPerTenant);
        } catch {
          // Ignore malformed cache and fall back to DB.
        }
      }
    }
    const metricsPerTenant =
      await this.metricsRepository.countMetricsByTenantId(tenantId);
    if (this.redis) {
      await this.redis.set(cacheKey, JSON.stringify(metricsPerTenant), {
        EX: 60,
      });
    }
    return metricsPerTenant;
  }

  async rateLimitMetrics(tenantId, metricsCount) {
    // If Redis is unavailable we do not block ingestion.
    // This keeps telemetry ingestion resilient, at the cost of skipping rate limit.
    if (!this.redis) {
      return { current: metricsCount, allowed: true };
    }

    // One key per tenant and per second.
    // Example: rate_metrics:tenantA:1732791452
    // This gives a strict "N metrics per second" window.
    const secondBucket = Math.floor(Date.now() / 1000);
    const rateKey = `rate_metrics:${tenantId}:${secondBucket}`;
    const MAX = Number(process.env.METRICS_PER_SECOND_LIMIT) || 50000;

    // INCRBY is atomic in Redis:
    // concurrent requests on the same key are serialized by Redis.
    // The returned value is the current count for this exact second bucket.
    const currentCount = await this.redis.incrBy(rateKey, metricsCount);
    console.log(`Rate limit check for tenant ${tenantId}: ${currentCount}/${MAX} metrics in current second`);

    // Keep the bucket only a few seconds to avoid memory growth.
    // We do this every call; it is idempotent and cheap.
    await this.redis.expire(rateKey, 3);

    // If limit is exceeded, rollback this increment so the bucket remains accurate.
    if (currentCount > MAX) {
      await this.redis.decrBy(rateKey, metricsCount);
      throw new BadRequestError(
        `Rate limit: ${currentCount}/${MAX} metrics/sec`,
      );
    }

    return { current: currentCount, allowed: true };
  }
  
  async ingestMetrics(payload) {
    // 1) Enforce tenant-level throughput limit first.
    // Failing early avoids unnecessary DB work on rejected bursts.
    await this.rateLimitMetrics(payload.tenantId, payload.metrics.length);

    let previousDeviceStatus = null;
    if (this.redis) {
      // 2) Read previous device state from Redis for observability/debugging.
      const deviceKey = `device:${payload.tenantId}:${payload.deviceId}`;
      const existingDeviceState = await this.redis.hGetAll(deviceKey);
      previousDeviceStatus = existingDeviceState?.status || null;

      // 3) Mark device as online and update heartbeat timestamp.
      await this.redis.hSet(deviceKey, {
        status: "online",
        lastPing: Date.now().toString(),
      });
    }

    // 4) Persist payload to MongoDB.
    await this.metricsRepository.ingestMetrics(payload);

    // 5) Invalidate cached counters derived from metrics.
    // Next read will rebuild cache from fresh DB state.
    if (this.redis) {
      await this.redis.del(`metrics_count_${payload.tenantId}`);
    }

    return {
      ingested: payload.metrics.length,
      previousDeviceStatus,
    };
  }
}
