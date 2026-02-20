import { hashPassword as defaultHashPassword } from '../../../shared/utils/hashing.js'

// Business logic for user operations.
export class ProfileService {
  constructor(userRepository, hashPassword = defaultHashPassword) {
    // Dependencies are injected for testability and decoupling.
    this.userRepository = userRepository
    this.hashPassword = hashPassword
  }

  // Register a new user if email is not already taken.
  async registerUser(data) {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Store only the password hash, never the plain password.
    const hashedPassword = await this.hashPassword(data.password)
    if (!hashedPassword) {
      throw new Error('Error hashing password')
    }

    return this.userRepository.createUser({ ...data, password: hashedPassword })
  }
}
