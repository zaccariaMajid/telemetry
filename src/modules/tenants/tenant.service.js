import { BadRequestError } from "../../../src/shared/errors/app-error.js";
import sanitizeUser from "../../../src/shared/utils/sanitize.js";

// Business logic for tenant operations.
export class TenantService {
  constructor(tenantRepository) {
    // Dependency is injected for testability and decoupling.
    this.tenantRepository = tenantRepository;
  }

  // Get all tenant tenants.
  async getAllTenants() {
    return this.tenantRepository.getAll();
  }

  // Get one tenant profile by id.
  async getTenantById(id) {
    const user = await this.tenantRepository.getById(id);
    if (!user) {
      throw new BadRequestError("Tenant not found");
    }
    return sanitizeUser(user);
  }

  async createTenant(data) {
    const existing = await this.tenantRepository.findByEmail(data.email);
    if (existing) {
      throw new BadRequestError("Email already in use");
    }
    return this.tenantRepository.createTenant(data);
  }
}
