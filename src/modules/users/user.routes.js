import { getAll, getById } from './user.controller.js';

async function userRoutes(fastify) {
  fastify.get('/', getAll);
  fastify.get('/:id', getById);
}

export default userRoutes;