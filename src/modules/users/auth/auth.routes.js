import { buildAuthController } from "./auth.controller.js";
import { userloginSchema } from "./validation/auth.login.js";
import { userRegisterSchema } from "./validation/auth.register.js";

// Route registration for auth module.
async function authRoutes(fastify, options) {
  const { authService } = options;
  if (!authService) {
    throw new Error("authService is required for authRoutes");
  }

  const { registerHandler, loginHandler, refreshHandler, logoutHandler } =
    buildAuthController({
      authService,
    });

  // Auth routes
  fastify.post(
    "/register",
    { schema: { body: userRegisterSchema } },
    registerHandler,
  );
  fastify.post("/login", { schema: { body: userloginSchema } }, loginHandler);
  fastify.post("/refresh", refreshHandler);
  fastify.post("/logout", logoutHandler);
}

export default authRoutes;
