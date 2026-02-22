import { AppError, BadRequestError } from "../../../shared/errors/app-error.js";
import {
  comparePassword as defaultComparePassword,
  hashPassword as defaultHashPassword,
} from "../../../shared/utils/hashing.js";
import crypto from "node:crypto";

// Business logic for auth operations.
export class AuthService {
  constructor({
    userRepository,
    authRepository,
    hashPassword = defaultHashPassword,
    comparePassword = defaultComparePassword,
    signToken,
  }) {
    // Dependencies are injected for testability.
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.hashPassword = hashPassword;
    this.comparePassword = comparePassword;
    this.signToken = signToken;
  }
  /**
   * 
   * @param {Object|null} user - The user object to sanitize.
   * @returns {Object|null} User object without sensitive fields, or null if input is falsy. 
   */
  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  generateToken(user) {
    if (!this.signToken) {
      throw new AppError("Token signer not configured");
    }

    return this.signToken(
      {
        sub: user._id.toString(),
        email: user.email,
        roles: Array.isArray(user.roles) ? user.roles : user.roles ? [user.roles] : []
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

  // Register a new user if email is not already taken.
  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }
    console.log("Registering user with data:", data);
    // Store only the password hash, never the plain password.
    const hashedPassword = await this.hashPassword(data.password);
    if (!hashedPassword) {
      throw new AppError("Error hashing password");
    }

    const createdUser = await this.userRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return this.sanitizeUser(createdUser);
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

    if (this.authRepository) {
      await this.authRepository.saveRefreshToken({
        userId: user._id.toString(),
        refreshToken,
        expiresAt,
      });
    }

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async refresh(token) {
    if (!this.authRepository) {
      throw new AppError("Auth repository not configured");
    }

    const saved = await this.authRepository.findByToken(token);

    if (!saved) throw new AppError("Invalid refresh token");
    if (saved.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(token);
      throw new AppError("Expired refresh token");
    }

    const user = await this.userRepository.getById(saved.userId);
    if (!user) {
      await this.authRepository.deleteRefreshToken(token);
      throw new AppError("User not found for refresh token");
    }

    const accessToken = await this.generateToken(user);
    return { accessToken };
  }

  async logout(token) {
    if (!this.authRepository) return;
    await this.authRepository.deleteRefreshToken(token);
  }
}
