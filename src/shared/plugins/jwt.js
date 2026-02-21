import fastifyPlugin from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function jwtPlugin(fastify) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: 'accessToken'
    }
  })

  // Decorator to protect routes and optionally enforce role-based access.
  fastify.decorate('authenticate', (roles) => async (req, reply) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return
    }

    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.roles
        ? [req.user.roles]
        : []

    const allowed = roles.some((role) => userRoles.includes(role))
    if (!allowed) {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  })
}

export default fastifyPlugin(jwtPlugin)
