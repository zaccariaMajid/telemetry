import { hashPassword as defaultHashPassword } from '../../shared/utils/hashing.js'

export class UserService {
  constructor(userRepository, hashPassword = defaultHashPassword) {
    this.userRepository = userRepository
    this.hashPassword = hashPassword
  }

  async registerUser(data) {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await this.hashPassword(data.password)
    if (!hashedPassword) {
      throw new Error('Error hashing password')
    }

    return this.userRepository.createUser({ ...data, password: hashedPassword })
  }
}
