import {
  createUserHandler,
  getAllUsers,
  getUserById
} from './user.controller.js'

async function userRoutes(fastify) {
  fastify.get('/check', async () => ({ hello: 'world' }))
  fastify.get('/', getAllUsers)
  fastify.get('/:id', getUserById)

  const userBodyJsonSchema = {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' }
    }
  }

  fastify.post('/', { schema: { body: userBodyJsonSchema } }, createUserHandler)
}

export default userRoutes
