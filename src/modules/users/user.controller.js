export const buildUserController = ({ userRepository, userService }) => ({
  getAllUsers: async (req, reply) => {
    const users = await userRepository.getAll()
    return reply.send(users)
  },

  getUserById: async (req, reply) => {
    const user = await userRepository.getById(req.params.id)

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    return reply.send(user)
  },

  createUserHandler: async (req, reply) => {
    const user = await userService.registerUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })

    return reply.status(201).send(user)
  }
})
