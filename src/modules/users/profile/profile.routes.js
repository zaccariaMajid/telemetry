import { buildProfileController } from "./profile.controller.js";
import { UserRepository } from "../user.repository.js";
import { ProfileService } from "./profile.service.js";
import { TenantRepository } from "../../tenants/tenants.repository.js";
import { TenantsModuleApi } from "../../tenants/tenants.module-api.js";

// Route registration and dependency wiring for users module.
async function profileRoutes(fastify) {
  // Compose module dependencies once per plugin scope.
  const userRepository = new UserRepository(fastify);
  const tenantRepository = new TenantRepository(fastify);
  const tenantsApi = new TenantsModuleApi(tenantRepository);
  const profileService = new ProfileService(userRepository, tenantsApi);
  const { getAllUsers, getUserById, getMyProfile, addRoleToUser, assignTenantToUser } =
    buildProfileController({ profileService });

  // GET routes
  fastify.get("/check", async () => ({ hello: "world" }));
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate(["admin"])] },
    getAllUsers,
  );
  fastify.get(
    "/:id",
    { onRequest: [fastify.authenticate(["admin"])] },
    getUserById,
  );
  fastify.get("/me", { onRequest: [fastify.authenticate()] }, getMyProfile);

  // PUT
  fastify.put(
    "/:id/roles",
    { onRequest: [fastify.authenticate(["admin"])] },
    addRoleToUser,
  );

  // PUT assign tenant to user
  fastify.put(
    "/:id/tenant",
    { onRequest: [fastify.authenticate(["admin"])] },
    assignTenantToUser,
  );
}

export default profileRoutes;
