import {
  comparePassword as defaultComparePassword,
  hashPassword as defaultHashPassword,
} from "../../../shared/utils/hashing.js";

import crypto from "crypto";

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

  sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  generateToken(user) {
    if (!this.signToken) {
      throw new Error("Token signer not configured");
    }

    return this.signToken(
      {
        sub: user._id.toString(),
        email: user.email,
      },
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
    );
  }

  generateRefreshToken() {
    var refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) ||
        30 * 24 * 60 * 60 * 1000,
    ); // 30 days
    return { refreshToken, expiresAt };
  }

  // Register a new user if email is not already taken.
  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Store only the password hash, never the plain password.
    const hashedPassword = await this.hashPassword(data.password);
    if (!hashedPassword) {
      throw new Error("Error hashing password");
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
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await this.comparePassword(
      data.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const accessToken = await this.generateToken(user);
    return { user: this.sanitizeUser(user), accessToken };
  }

  async refresh(token) {
    const saved = await this.authRepository.findByToken(token);

    if (!saved) throw new Error("Refresh token non valido");
    if (saved.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(token);
      throw new Error("Refresh token scaduto");
    }

    const accessToken = jwt.sign({ id: saved.userId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return { accessToken };
  }

  async logout(token) {
    await deleteRefreshToken(token);
  }
}
