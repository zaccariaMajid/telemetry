import 'dotenv/config'
import Fastify from 'fastify'
import dbConnector from './src/shared/plugins/db-connector.js'
import userRoutes from './src/modules/users/user.routes.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
})

fastify.register(dbConnector)
fastify.register(userRoutes, { prefix: '/users' })

fastify.listen({ port: Number(process.env.PORT) || 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
