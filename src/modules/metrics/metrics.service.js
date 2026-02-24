import { BadRequestError } from "../../shared/errors/app-error.js";

// Business logic for metrics operations.
export class MetricsService {
  constructor(metricsRepository, usersApi) {
    // Dependency is injected for testability and decoupling.
    this.metricsRepository = metricsRepository;
    this.tenantApi = tenantApi;
  }

  // Ingest metrics for a device under a tenant.
  async ingestMetrics(payload) {
    // Validate tenant can ingest before processing.
    const tenant = await this.tenantApi.getTenantById(payload.tenantId);
    if (!tenant) {
      throw new BadRequestError(`Tenant ${payload.tenantId} not found`);
    }
    const metricsPerTenant = await this.metricsRepository.countMetricsByTenantId(payload.tenantId);
    if (metricsPerTenant + payload.metrics.length > tenant.max_metrics_seconds) {
      throw new BadRequestError(`Ingesting ${payload.metrics.length} metrics would exceed tenant limit of ${tenant.max_metrics_seconds}`);
    }
    // Create and return the metrics document.
    return this.metricsRepository.createMetrics(payload);
  }
}
