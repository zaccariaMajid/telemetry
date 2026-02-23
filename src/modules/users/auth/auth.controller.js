// Builds HTTP handlers for auth endpoints.
export const buildAuthController = ({ authService }) => ({
  // POST /auth/register
  registerHandler: async (req, reply) => {
    const user = await authService.register({
      tenantId: req.body.tenantId,
      full_name: req.body.full_name,
      email: req.body.email,
      password: req.body.password,
      roles: req.body.roles || [],
      is_active: req.body.is_active || false,
    });

    return reply.status(201).send(user);
  },

  // POST /auth/login
  loginHandler: async (req, reply) => {
    const { user, accessToken, refreshToken } = await authService.login({
      email: req.body.email,
      password: req.body.password,
    });

    return reply
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
      })
      .status(200)
      .send({ user, accessToken });
  },

  // POST /auth/refresh
  refreshHandler: async (req, reply) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token not provided" });
    }
    
    const { accessToken } = await authService.refresh(refreshToken);
    return reply
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 60 * 15, // 15 minuti
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
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .send({ message: "Logged out successfully" });
  },
});
