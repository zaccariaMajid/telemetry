import { buildProfileController } from "./profile.controller.js";

// Route registration for profile module.
async function profileRoutes(fastify, options) {
  const { profileService } = options;
  if (!profileService) {
    throw new Error("profileService is required for profileRoutes");
  }

  const { getAllUsers, getUserById, getMyProfile, addRoleToUser, assignTenantToUser } =
    buildProfileController({ profileService });

  // GET routes
  fastify.get("/check", async () => ({ hello: "world" }));
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate(["admin"])] },
    getAllUsers,
  );
  fastify.get(
    "/:id",
    { onRequest: [fastify.authenticate(["admin"])] },
    getUserById,
  );
  fastify.get("/me", { onRequest: [fastify.authenticate()] }, getMyProfile);

  // PUT
  fastify.put(
    "/:id/roles",
    { onRequest: [fastify.authenticate(["admin"])] },
    addRoleToUser,
  );

  // PUT assign tenant to user
  fastify.put(
    "/:id/tenant",
    { onRequest: [fastify.authenticate(["admin"])] },
    assignTenantToUser,
  );
}

export default profileRoutes;
