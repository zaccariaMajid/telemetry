import { buildAuthController } from './auth.controller.js'
import { AuthRepository } from './auth.repository.js'
import { AuthService } from './auth.service.js'
import { UserRepository } from '../user.repository.js'
import { userloginSchema } from './validation/auth.login.js'
import { userRegisterSchema } from './validation/auth.register.js'

// Route registration and dependency wiring for auth module.
async function authRoutes(fastify) {
  // Compose auth dependencies once per plugin scope.
  const userRepository = new UserRepository(fastify)
  const authRepository = new AuthRepository(fastify)
  const authService = new AuthService({
    userRepository,
    authRepository,
    signToken: (payload, options) => fastify.jwt.sign(payload, options)
  })
  const { registerHandler, loginHandler, refreshHandler, logoutHandler } =
    buildAuthController({
      authService
    })

  // Auth routes
  fastify.post(
    "/register",
    { schema: { body: userRegisterSchema } },
    registerHandler,
  )
  fastify.post(
    "/login",
    { schema: { body: userloginSchema } },
    loginHandler,
  )
  fastify.post('/refresh', refreshHandler)
  fastify.post('/logout', logoutHandler)
}

export default authRoutes
