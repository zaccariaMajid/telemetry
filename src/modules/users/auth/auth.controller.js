// Builds HTTP handlers for auth endpoints.
export const buildAuthController = ({ authService }) => ({
  // POST /auth/register
  registerHandler: async (req, reply) => {
    const user = await authService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })

    return reply.status(201).send(user)
  },

  // POST /auth/login
  loginHandler: async (req, reply) => {
    const user = await authService.login({
      email: req.body.email,
      password: req.body.password
    })

    return reply.status(200).send(user)
  }
})
