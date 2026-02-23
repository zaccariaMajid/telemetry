import { buildTenantController } from "./tenant.controller.js";
import { TenantRepository } from "./tenants.repository.js";
import { TenantService } from "./tenant.service.js";
import { tenantCreateSchema } from "./validation/tenant.create.js";

// Route registration and dependency wiring for users module.
async function tenantRoutes(fastify) {
  // Compose module dependencies once per plugin scope.
  const tenantRepository = new TenantRepository(fastify);
  const tenantService = new TenantService(tenantRepository);
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
    { schema: tenantCreateSchema },
    createTenant,
  );
}

export default tenantRoutes;
