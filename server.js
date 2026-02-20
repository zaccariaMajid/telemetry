import 'dotenv/config'
import Fastify from 'fastify'
import dbConnector from './src/shared/plugins/db-connector.js'
import authRoutes from './src/modules/users/auth/auth.routes.js'
import profileRoutes from './src/modules/users/profile/profile.routes.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
})

fastify.register(dbConnector)
fastify.register(authRoutes, { prefix: '/auth' })
fastify.register(profileRoutes, { prefix: '/users' })

fastify.listen({ port: Number(process.env.PORT) || 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
