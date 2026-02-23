import { buildTenantController } from "./tenant.controller.js";
import { TenantRepository } from "./tenants.repository.js";
import { TenantService } from "./tenant.service.js";
import { UserRepository } from "../users/user.repository.js";
import { UsersModuleApi } from "../users/users.module-api.js";
import { tenantCreateSchema } from "./validation/tenant.create.js";

// Route registration and dependency wiring for users module.
async function tenantRoutes(fastify) {
  // Compose module dependencies once per plugin scope.
  const tenantRepository = new TenantRepository(fastify);
  const userRepository = new UserRepository(fastify);
  const usersApi = new UsersModuleApi(userRepository);
  const tenantService = new TenantService(tenantRepository, usersApi);
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
