import { buildUserController } from './user.controller.js'
import { UserRepository } from './user.repository.js'
import { UserService } from './user.service.js'
import { userCreationSchema } from './validation/user.creation.js'

async function userRoutes(fastify) {
  const userRepository = new UserRepository(fastify)
  const userService = new UserService(userRepository)
  const { getAllUsers, getUserById, createUserHandler } = buildUserController({
    userRepository,
    userService
  })

  //GET
  fastify.get('/check', async () => ({ hello: 'world' }))
  fastify.get('/', getAllUsers)
  fastify.get('/:id', getUserById)

  //POST
  fastify.post('/', { schema: { body: userCreationSchema } }, createUserHandler)

  //PUT

  //DELETE
}

export default userRoutes
