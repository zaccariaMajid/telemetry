// Builds HTTP handlers using injected dependencies.
export const buildProfileController = ({ profileService }) => ({
  // GET /users
  getAllUsers: async (req, reply) => {
    const users = await profileService.getAllProfiles();
    return reply.send(users);
  },

  // GET /users/:id
  getUserById: async (req, reply) => {
    const user = await profileService.getProfileById(req.params.id);

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
    return reply.send(user);
  },

  //GET /users/me
  getMyProfile: async (req, reply) => {
    const user = await profileService.getProfileById(req.user.sub);
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  },

  // PUT /users/:id/roles
  addRoleToUser: async (req, reply) => {
    const { role } = req.body;
    if (!role) {
      return reply.status(400).send({ error: "Role is required" });
    }
    const updatedUser = await profileService.addRoleToUser(req.params.id, role);
    return reply.send(updatedUser);
  },
});
