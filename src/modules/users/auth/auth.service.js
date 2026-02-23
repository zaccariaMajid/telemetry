import {
  AppError,
  BadRequestError,
  UnauthorizedError,
} from "../../../shared/errors/app-error.js";
import {
  comparePassword as defaultComparePassword,
  hashPassword as defaultHashPassword,
} from "../../../shared/utils/hashing.js";
import crypto from "node:crypto";
import sanitizeUser from "../../../shared/utils/sanitize.js";

// Business logic for auth operations.
export class AuthService {
  constructor({
    userRepository,
    authRepository,
    hashPassword = defaultHashPassword,
    comparePassword = defaultComparePassword,
    signToken,
    tenantsApi,
  }) {
    // Dependencies are injected for testability.
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.hashPassword = hashPassword;
    this.comparePassword = comparePassword;
    this.signToken = signToken;
    this.tenantsApi = tenantsApi;
  }

  generateToken(user) {
    if (!this.signToken) {
      throw new AppError("Token signer not configured");
    }

    return this.signToken(
      {
        sub: user._id.toString(),
        tenantId: user.tenantId || null,
        email: user.email,
        roles: Array.isArray(user.roles)
          ? user.roles
          : user.roles
            ? [user.roles]
            : [],
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
    );
  }

  getRefreshTokenTtlMs() {
    const configured = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_MS);
    if (Number.isFinite(configured) && configured > 0) return configured;
    return 30 * 24 * 60 * 60 * 1000;
  }

  generateRefreshToken() {
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlMs());
    return { refreshToken, expiresAt };
  }

  hashRefreshToken(refreshToken) {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
  }

  // Register a new user if email is not already taken.
  async register(data) {
    let tenantId = data.tenantId;
    let role = "user";
    let createdTenantId = null;

    if (tenantId) {
      if (!this.tenantsApi) {
        throw new AppError("Tenants API not configured");
      }
      const tenant = await this.tenantsApi.getTenantById(tenantId);
      if (!tenant) {
        throw new BadRequestError("Tenant not found");
      }
    } else {
      if (!this.tenantsApi) {
        throw new AppError("Tenants API not configured");
      }
      if (!data.tenant) {
        throw new BadRequestError(
          "tenant payload is required when tenantId is missing",
        );
      }

      const createdTenant = await this.tenantsApi.createTenant(data.tenant);
      tenantId = createdTenant?._id?.toString?.() || createdTenant?.id;
      createdTenantId = tenantId;
      role = "admin";
    }

    const existingUser = await this.userRepository.findByEmailAndTenant(
      data.email,
      tenantId,
    );
    if (existingUser) {
      throw new BadRequestError("User already exists in this tenant");
    }

    // Store only the password hash, never the plain password.
    const hashedPassword = await this.hashPassword(data.password);
    if (!hashedPassword) {
      throw new AppError("Error hashing password");
    }

    try {
      const createdUser = await this.userRepository.createUser({
        tenantId,
        full_name: data.full_name,
        email: data.email,
        password: hashedPassword,
        roles: [role],
        is_active: true,
      });
      return sanitizeUser(createdUser);
    } catch (err) {
      if (createdTenantId) {
        await this.tenantsApi.deleteTenantById(createdTenantId);
      }
      throw err;
    }
  }

  // Validate credentials and return user data.
  async login(data) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const isValidPassword = await this.comparePassword(
      data.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new BadRequestError("Invalid credentials");
    }

    const accessToken = await this.generateToken(user);
    const { refreshToken, expiresAt } = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    if (this.authRepository) {
      await this.authRepository.saveRefreshToken({
        userId: user._id.toString(),
        refreshTokenHash,
        expiresAt,
      });
    }

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async refresh(token) {
    if (!this.authRepository) {
      throw new AppError("Auth repository not configured");
    }
    if (!token) {
      throw new UnauthorizedError("Refresh token not provided");
    }

    const tokenHash = this.hashRefreshToken(token);
    const saved = await this.authRepository.findByTokenHash(tokenHash);

    if (!saved) throw new UnauthorizedError("Invalid refresh token");
    if (saved.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshTokenByHash(tokenHash);
      throw new UnauthorizedError("Expired refresh token");
    }

    const user = await this.userRepository.getById(saved.userId);
    if (!user) {
      await this.authRepository.deleteRefreshTokenByHash(tokenHash);
      throw new UnauthorizedError("User not found for refresh token");
    }

    // Rotate refresh token: invalidate old token and issue a new one.
    await this.authRepository.deleteRefreshTokenByHash(tokenHash);

    const accessToken = await this.generateToken(user);
    const { refreshToken, expiresAt } = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    await this.authRepository.saveRefreshToken({
      userId: user._id.toString(),
      refreshTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async logout(token) {
    if (!this.authRepository) return;
    const tokenHash = this.hashRefreshToken(token);
    await this.authRepository.deleteRefreshTokenByHash(tokenHash);
  }
}
