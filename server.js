import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import dbConnector from './src/shared/plugins/db-connector.js'
import jwtPlugin from './src/shared/plugins/jwt.js'
import authRoutes from './src/modules/users/auth/auth.routes.js'
import profileRoutes from './src/modules/users/profile/profile.routes.js'
import tenantRoutes from './src/modules/tenants/tenant.routes.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: false
})

fastify.register(dbConnector)
fastify.register(fastifyCookie, {
  hook: 'onRequest'
})
fastify.register(jwtPlugin)
fastify.register(authRoutes, { prefix: '/auth' })
fastify.register(profileRoutes, { prefix: '/users' })
fastify.register(tenantRoutes, { prefix: '/tenants' })

fastify.listen({ port: Number(process.env.PORT) || 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
