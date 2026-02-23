import { BadRequestError } from "../../shared/errors/app-error.js";

// Public contract exposed by Users module to other modules.
export class UsersModuleApi {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async countUsersByTenant(tenantId) {
    if (!tenantId) {
      throw new BadRequestError("tenantId is required");
    }
    return this.userRepository.countByTenant(tenantId);
  }
}
