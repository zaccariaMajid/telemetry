// Builds HTTP handlers using injected dependencies.
export const buildMetricsController = ({ metricsService }) => ({
  // GET /metrics
  getAllMetrics: async (req, reply) => {
    const metrics = await metricsService.getAllMetrics();
    return reply.send(metrics);
  },

  // POST /metrics
  ingestMetrics: async (req, reply) => {
    const metrics = await metricsService.ingestMetrics(req.body);
    return reply.send(metrics);
  }
});