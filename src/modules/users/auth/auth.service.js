import {
  comparePassword as defaultComparePassword,
  hashPassword as defaultHashPassword
} from '../../../shared/utils/hashing.js'

// Business logic for auth operations.
export class AuthService {
  constructor({
    userRepository,
    hashPassword = defaultHashPassword,
    comparePassword = defaultComparePassword,
    signToken
  }) {
    // Dependencies are injected for testability.
    this.userRepository = userRepository
    this.hashPassword = hashPassword
    this.comparePassword = comparePassword
    this.signToken = signToken
  }

  sanitizeUser(user) {
    if (!user) return null
    const { password, ...safeUser } = user
    return safeUser
  }

  generateToken(user) {
    if (!this.signToken) {
      throw new Error('Token signer not configured')
    }

    return this.signToken(
      {
        sub: user._id.toString(),
        email: user.email
      },
      { expiresIn: '1h' }
    )
  }


  // Register a new user if email is not already taken.
  async register(data) {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Store only the password hash, never the plain password.
    const hashedPassword = await this.hashPassword(data.password)
    if (!hashedPassword) {
      throw new Error('Error hashing password')
    }

    const createdUser = await this.userRepository.createUser({
      ...data,
      password: hashedPassword
    })

    return this.sanitizeUser(createdUser)
  }

  // Validate credentials and return user data.
  async login(data) {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await this.comparePassword(data.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    const accessToken = await this.generateToken(user)
    return { user: this.sanitizeUser(user), accessToken }
  }
}
