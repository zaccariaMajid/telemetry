import {
  createUserHandler,
  getAllUsers,
  getUserById
} from './user.controller.js'
import { userCreationSchema } from './validation/user.creation.js'

async function userRoutes(fastify) {
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
