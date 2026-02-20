// Business logic for profile operations.
export class ProfileService {
  constructor(userRepository) {
    // Dependency is injected for testability and decoupling.
    this.userRepository = userRepository
  }

  // Get all user profiles.
  async getAllProfiles() {
    return this.userRepository.getAll()
  }

  // Get one user profile by id.
  async getProfileById(id) {
    return this.userRepository.getById(id)
  }
}
