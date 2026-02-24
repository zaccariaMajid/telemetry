import { buildMetricsController } from "./metrics.controller.js";
import { metricsIngestSchema } from "./validation/metrics.injest.js";

// Route registration for metrics module.
async function metricsRoutes(fastify, options) {
  const { metricsService } = options;
  if (!metricsService) {
    throw new Error("metricsService is required for metricsRoutes");
  }

  const {
    getAllMetrics,
    ingestMetrics,
    getMetricsByRange,
    deleteMetricsByTenantIdDeviceIdAndTimeRange,
  } = buildMetricsController({
    metricsService,
  });

  // GET routes
  fastify.get("/check", async () => ({ hello: "world" }));
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate(["admin"])] },
    getAllMetrics,
  );
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate(["admin"])],
      schema: { body: metricsIngestSchema },
    },
    ingestMetrics,
  );
  fastify.get(
    "/range",
    {
      onRequest: [fastify.authenticate(["admin"])],
    },
    getMetricsByRange,
  );
  fastify.delete(
    "/",
    {
      onRequest: [fastify.authenticate(["admin"])],
    },
    deleteMetricsByTenantIdDeviceIdAndTimeRange,
  );
}

export default metricsRoutes;
