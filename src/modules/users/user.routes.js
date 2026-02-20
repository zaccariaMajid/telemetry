import { buildUserController } from './user.controller.js'
import { UserRepository } from './user.repository.js'
import { UserService } from './user.service.js'
import { userCreationSchema } from './validation/user.creation.js'

// Route registration and dependency wiring for users module.
async function userRoutes(fastify) {
  // Compose module dependencies once per plugin scope.
  const userRepository = new UserRepository(fastify)
  const userService = new UserService(userRepository)
  const { getAllUsers, getUserById, createUserHandler } = buildUserController({
    userRepository,
    userService
  })

  // GET routes
  fastify.get('/check', async () => ({ hello: 'world' }))
  fastify.get('/', getAllUsers)
  fastify.get('/:id', getUserById)

  // POST routes
  fastify.post('/', { schema: { body: userCreationSchema } }, createUserHandler)

  // PUT/DELETE routes can be added here.
}

export default userRoutes
