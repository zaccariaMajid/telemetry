import { BadRequestError } from "../../shared/errors/app-error.js";

function parseIntervalToMs(interval) {
  const match = /^(\d+)(s|m|h|d)$/i.exec(String(interval || "").trim());
  if (!match) {
    throw new BadRequestError("Invalid interval format. Use: 30s, 5m, 1h, 1d");
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitMs[unit];
}

// Builds HTTP handlers using injected dependencies.
export const buildMetricsController = ({ metricsService }) => ({
  // GET /metrics
  getAllMetrics: async (req, reply) => {
    const metrics = await metricsService.getAllMetrics();
    return reply.send(metrics);
  },
  // GET /metrics/range?tenantId=...&deviceId=...&from=...&to=...&interval=...
  getMetricsByRange: async (req, reply) => {
    const { tenantId, deviceId, interval } = req.query;
    let { from, to } = req.query;
    if (interval) {
      to = new Date();
      from = new Date(to.getTime() - parseIntervalToMs(interval));
    }
    
    const metrics = await metricsService.getMetricsByRange(
      tenantId,
      deviceId,
      from,
      to,
    );
    return reply.send(metrics);
  },
  // POST /metrics
  ingestMetrics: async (req, reply) => {
    const metrics = await metricsService.ingestMetrics(req.body);
    return reply.send(metrics);
  },

  deleteMetricsByTenantIdDeviceIdAndTimeRange: async (req, reply) => {
    const { tenantId, deviceId, from, to } = req.query;
    await metricsService.deleteMetricsByTenantIdDeviceIdAndTimeRange(
      tenantId,
      deviceId,
      new Date(from),
      new Date(to),
    );
    return reply.send({ success: true });
  }
});
