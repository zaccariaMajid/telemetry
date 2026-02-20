import { buildProfileController } from './profile.controller.js'
import { UserRepository } from '../user.repository.js'
import { ProfileService } from './profile.service.js'

// Route registration and dependency wiring for users module.
async function profileRoutes(fastify) {
  // Compose module dependencies once per plugin scope.
  const userRepository = new UserRepository(fastify)
  const profileService = new ProfileService(userRepository)
  const { getAllUsers, getUserById } = buildProfileController({ profileService })

  // GET routes
  fastify.get('/check', async () => ({ hello: 'world' }))
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllUsers)
  fastify.get('/:id', getUserById)

  // PUT/DELETE routes can be added here.
}

export default profileRoutes
