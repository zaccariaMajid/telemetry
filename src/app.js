import Fastify from 'fastify';
// import prismaPlugin from './shared/plugins/prisma.plugin.js';
// import userRoutes from './modules/users/user.routes.js';
// import tenantRoutes from './modules/tenants/tenant.routes.js';

const app = Fastify({ logger: true });

// await app.register(userRoutes, { prefix: '/api/users' });
// await app.register(tenantRoutes, { prefix: '/api/tenants' });
// await app.register(errorHandlerPlugin);

export default app;