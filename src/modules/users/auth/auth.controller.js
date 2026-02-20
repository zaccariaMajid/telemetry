// Builds HTTP handlers for auth endpoints.
export const buildAuthController = ({ authService }) => ({
  // POST /auth/register
  registerHandler: async (req, reply) => {
    const user = await authService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    return reply.status(201).send(user);
  },

  // POST /auth/login
  loginHandler: async (req, reply) => {
    const user = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });
    reply
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "strict",
        maxAge: 60 * 15, // 15 minuti
      })
      .setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    return reply.status(200).send(user);
  },
  // POST /auth/refresh
  refreshHandler: async (req, reply) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token not provided" });
    }

    try {
      const { accessToken } = await authService.refresh(refreshToken);
      return reply
        .setCookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 60 * 15, // 15 minuti
        })
        .send({ message: "Token refreshed successfully" });
    } catch (error) {
      return reply.status(401).send({ error: error.message });
    }
  },

  // POST /auth/logout
  logoutHandler: async (req, reply) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    return reply
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .send({ message: "Logged out successfully" });
  },
});
