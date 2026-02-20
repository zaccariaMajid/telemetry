import { createUser, getAll, getById } from './user.repository.js'

export const getAllUsers = async (req, reply) => {
  const users = await getAll(req.server)
  return reply.send(users)
}

export const getUserById = async (req, reply) => {
  const user = await getById(req.server, req.params.id)

  if (!user) {
    return reply.status(404).send({ error: 'User not found' })
  }

  return reply.send(user)
}

export const createUserHandler = async (req, reply) => {
  const user = await createUser(req.server, {
    name: req.body.name,
    email: req.body.email
  })

  return reply.status(201).send(user)
}
