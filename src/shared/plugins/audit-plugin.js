import fastifyPlugin from "fastify-plugin";

async function auditPlugin(fastify, options) {
  const resolveUserId = async (request) => {
    if (request.user?.sub || request.user?.id) {
      return request.user.sub || request.user.id;
    }

    // For non-protected routes, try to hydrate req.user from cookie/header JWT.
    // Ignore failures to avoid forcing auth on public endpoints.
    try {
      if (request.cookies?.accessToken || request.headers.authorization) {
        await request.jwtVerify();
      }
    } catch (_) {
      return null;
    }

    return request.user?.sub || request.user?.id || null;
  };

  fastify.addHook("preHandler", async (request) => {
    const body = request.body;

    if (!body || typeof body !== "object") return;

    if (request.method === "POST") {
      delete body.createdAt;
      delete body.createdBy;

      body.createdAt = new Date();
      body.createdBy = await resolveUserId(request);
    }
  });
}

export default fastifyPlugin(auditPlugin);
