// AUTH
import { AuthRepository } from "./users/auth/auth.repository.js";
import authRoutes from "./users/auth/auth.routes.js";
import { AuthService } from "./users/auth/auth.service.js";
//PROFILE
import profileRoutes from "./users/profile/profile.routes.js";
import { ProfileService } from "./users/profile/profile.service.js";
//USER
import { UserRepository } from "./users/user.repository.js";
import { UsersModuleApi } from "./users/users.module-api.js";
//TENANT
import tenantRoutes from "./tenants/tenant.routes.js";
import { TenantRepository } from "./tenants/tenants.repository.js";
import { TenantsModuleApi } from "./tenants/tenants.module-api.js";
import { TenantService } from "./tenants/tenant.service.js";
// DEVICE
import { DeviceRepository } from "./devices/device.repository.js";
import { DeviceService } from "./devices/device.service.js";
import deviceRoutes from "./devices/device.routes.js";

async function moduleOrchestrator(fastify) {
  // Composition root: build dependencies once and inject them into modules.
  const userRepository = new UserRepository(fastify);
  const authRepository = new AuthRepository(fastify);
  const tenantRepository = new TenantRepository(fastify);
  const deviceRepository = new DeviceRepository(fastify);

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
  const deviceService = new DeviceService(deviceRepository, tenantsApi);

  // Register slices with explicit dependency injection.
  fastify.register(authRoutes, { prefix: "/auth", authService });
  fastify.register(profileRoutes, { prefix: "/users", profileService });
  fastify.register(tenantRoutes, { prefix: "/tenants", tenantService });
  fastify.register(deviceRoutes, { prefix: "/devices", deviceService });
}

export default moduleOrchestrator;
