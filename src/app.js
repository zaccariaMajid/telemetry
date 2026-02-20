import Fastify from 'fastify';
// import prismaPlugin from './shared/plugins/prisma.plugin.js';
import userRoutes from './modules/users/user.routes.js';

const app = Fastify({ logger: false });

// await app.register(prismaPlugin);
await app.register(userRoutes, { prefix: '/api/users' });

export default app;