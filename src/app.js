import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import dbConnector from './shared/plugins/db-connector.js'
import jwtPlugin from './shared/plugins/jwt.js'
import errorHandlerPlugin from './shared/plugins/error-handler.plugin.js'
import authRoutes from './modules/users/auth/auth.routes.js'
import profileRoutes from './modules/users/profile/profile.routes.js'
import tenantRoutes from './modules/tenants/tenant.routes.js'
import auditPlugin from './shared/plugins/audit-plugin.js'
import { UserRepository } from './modules/users/user.repository.js'
import { AuthRepository } from './modules/users/auth/auth.repository.js'
import { TenantRepository } from './modules/tenants/tenants.repository.js'
import { TenantsModuleApi } from './modules/tenants/tenants.module-api.js'
import { UsersModuleApi } from './modules/users/users.module-api.js'
import { AuthService } from './modules/users/auth/auth.service.js'
import { ProfileService } from './modules/users/profile/profile.service.js'
import { TenantService } from './modules/tenants/tenant.service.js'

const app = Fastify({
  logger: false
});

app.register(dbConnector);
app.register(fastifyCookie, {
  hook: 'onRequest'
});
app.register(jwtPlugin);
app.register(auditPlugin);
app.register(errorHandlerPlugin);

app.register(async function moduleOrchestrator(fastify) {
  // Compose infra dependencies once and inject into modules.
  const userRepository = new UserRepository(fastify);
  const authRepository = new AuthRepository(fastify);
  const tenantRepository = new TenantRepository(fastify);

  await authRepository.ensureIndexes();

  // Cross-module contracts.
  const tenantsApi = new TenantsModuleApi(tenantRepository);
  const usersApi = new UsersModuleApi(userRepository);

  // Module services.
  const authService = new AuthService({
    userRepository,
    authRepository,
    signToken: (payload, options) => fastify.jwt.sign(payload, options),
    tenantsApi,
  });
  const profileService = new ProfileService(userRepository, tenantsApi);
  const tenantService = new TenantService(tenantRepository, usersApi);

  fastify.register(authRoutes, { prefix: '/auth', authService });
  fastify.register(profileRoutes, { prefix: '/users', profileService });
  fastify.register(tenantRoutes, { prefix: '/tenants', tenantService });
});

export default app
