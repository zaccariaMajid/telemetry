// Builds HTTP handlers using injected dependencies.
export const buildProfileController = ({ profileService }) => ({
  // GET /users
  getAllUsers: async (req, reply) => {
    const users = await profileService.getAllProfiles()
    return reply.send(users)
  },

  // GET /users/:id
  getUserById: async (req, reply) => {
    const user = await profileService.getProfileById(req.params.id)

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    return reply.send(user)
  }
})
