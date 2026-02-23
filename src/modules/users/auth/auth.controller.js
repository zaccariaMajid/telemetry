// Builds HTTP handlers for auth endpoints.
export const buildAuthController = ({ authService }) => ({
  // POST /auth/register
  registerHandler: async (req, reply) => {
    const user = await authService.register({
      tenantId: req.body.tenantId,
      tenant: req.body.tenant,
      full_name: req.body.full_name,
      email: req.body.email,
      password: req.body.password
    });

    return reply.status(201).send(user);
  },

  // POST /auth/login
  loginHandler: async (req, reply) => {
    const isProd = process.env.NODE_ENV === "production";
    const { user, accessToken, refreshToken } = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    return reply
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict", // Sends cookie only on same-site requests (CSRF protection)
        path: "/",
        maxAge: 60 * 15, // 15 minuti
      })
      .setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/auth",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      .status(200)
      .send({ user, accessToken }); //! CLEAR ACCESS TOKEN FROM RESPONSE BODY IN PRODUCTION, USE ONLY COOKIES FOR TOKENS
  },

  // POST /auth/refresh
  refreshHandler: async (req, reply) => {
    const isProd = process.env.NODE_ENV === "production";
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token not provided" });
    }
    
    const { accessToken, refreshToken: rotatedRefreshToken } = await authService.refresh(refreshToken);
    return reply
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 15, // 15 minuti
      })
      .setCookie("refreshToken", rotatedRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/auth",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      .send({ accessToken });
  },

  // POST /auth/logout
  logoutHandler: async (req, reply) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    return reply
      .clearCookie("accessToken", { path: "/" })
      .clearCookie("refreshToken", { path: "/auth" })
      .send({ message: "Logged out successfully" });
  },
});
