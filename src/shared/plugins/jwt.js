import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function jwtPlugin(fastify) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET
  });

  // decorator per proteggere le routes
  fastify.decorate('authenticate', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Non autorizzato' });
    }
  });
}

export default fastifyPlugin(jwtPlugin);