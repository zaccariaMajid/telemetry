import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import dbConnector from './shared/plugins/db-connector.js'
import jwtPlugin from './shared/plugins/jwt.js'
import authRoutes from './modules/users/auth/auth.routes.js'
import profileRoutes from './modules/users/profile/profile.routes.js'
import tenantRoutes from './modules/tenants/tenant.routes.js'
import auditPlugin from './shared/plugins/audit-plugin.js'

const app = Fastify({
  logger: false
});

app.register(dbConnector);
app.register(fastifyCookie, {
  hook: 'onRequest'
});
app.register(jwtPlugin);
app.register(auditPlugin);

app.register(authRoutes, { prefix: '/auth' });
app.register(profileRoutes, { prefix: '/users' });
app.register(tenantRoutes, { prefix: '/tenants' });

export default app
