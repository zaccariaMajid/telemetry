import authRoutes from "./users/auth/auth.routes.js";
import profileRoutes from "./users/profile/profile.routes.js";
import tenantRoutes from "./tenants/tenant.routes.js";
import { UserRepository } from "./users/user.repository.js";
import { AuthRepository } from "./users/auth/auth.repository.js";
import { TenantRepository } from "./tenants/tenants.repository.js";
import { TenantsModuleApi } from "./tenants/tenants.module-api.js";
import { UsersModuleApi } from "./users/users.module-api.js";
import { AuthService } from "./users/auth/auth.service.js";
import { ProfileService } from "./users/profile/profile.service.js";
import { TenantService } from "./tenants/tenant.service.js";

async function moduleOrchestrator(fastify) {
  // Composition root: build dependencies once and inject them into modules.
  const userRepository = new UserRepository(fastify);
  const authRepository = new AuthRepository(fastify);
  const tenantRepository = new TenantRepository(fastify);

  // Cross-module contracts.
  const tenantsApi = new TenantsModuleApi(tenantRepository);
  const usersApi = new UsersModuleApi(userRepository);

  // Module services (application use cases).
  const authService = new AuthService({
    userRepository,
    authRepository,
    signToken: (payload, options) => fastify.jwt.sign(payload, options),
    tenantsApi,
  });
  const profileService = new ProfileService(userRepository, tenantsApi);
  const tenantService = new TenantService(tenantRepository, usersApi);

  // Register slices with explicit dependency injection.
  fastify.register(authRoutes, { prefix: "/auth", authService });
  fastify.register(profileRoutes, { prefix: "/users", profileService });
  fastify.register(tenantRoutes, { prefix: "/tenants", tenantService });
}

export default moduleOrchestrator;
