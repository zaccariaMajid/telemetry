import { BadRequestError } from "../../../shared/errors/app-error.js";
import sanitizeUser from "../../../shared/utils/sanitize.js";

// Business logic for profile operations.
export class ProfileService {
  constructor(userRepository, tenantsApi) {
    // Dependency is injected for testability and decoupling.
    this.userRepository = userRepository;
    this.tenantsApi = tenantsApi;
  }

  // Get all user profiles.
  async getAllProfiles() {
    return this.userRepository.getAll();
  }

  // Get one user profile by id.
  async getProfileById(id) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    return sanitizeUser(user);
  }

  // Add a role to a user.
  async addRoleToUser(userId, role) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (!user.roles) {
      user.roles = [];
    }
    if (!user.roles.includes(role)) {
      user.roles.push(role);
      await this.userRepository.update(userId, { roles: user.roles });
    }
    return sanitizeUser(user);
  }

  async assignTenantToUser(userId, tenantId) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    const tenant = this.tenantsApi ? await this.tenantsApi.getTenantById(tenantId) : null;
    if (!tenant) {
      throw new BadRequestError("Tenant not found");
    }
    await this.userRepository.update(userId, { tenantId });
    return sanitizeUser({ ...user, tenantId });
  }
}
