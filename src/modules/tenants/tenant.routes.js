import { buildTenantController } from "./tenant.controller.js";
import { tenantCreateSchema } from "./validation/tenant.create.js";

// Route registration for tenants module.
async function tenantRoutes(fastify, options) {
  const { tenantService } = options;
  if (!tenantService) {
    throw new Error("tenantService is required for tenantRoutes");
  }

  const { getAllTenants, getTenantById, createTenant } = buildTenantController({
    tenantService,
  });

  // GET routes
  fastify.get("/check", async () => ({ hello: "world" }));
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate(["admin"])] },
    getAllTenants,
  );
  fastify.get(
    "/:id",
    { onRequest: [fastify.authenticate(["admin"])] },
    getTenantById,
  );
  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate(["admin"])],
      schema: { body: tenantCreateSchema },
    },
    createTenant,
  );
}

export default tenantRoutes;
