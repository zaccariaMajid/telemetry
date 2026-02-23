import { BadRequestError } from "../../shared/errors/app-error.js";
import sanitizeUser from "../../shared/utils/sanitize.js";

// Business logic for tenant operations.
export class TenantService {
  constructor(tenantRepository, usersApi) {
    // Dependency is injected for testability and decoupling.
    this.tenantRepository = tenantRepository;
    this.usersApi = usersApi;
  }

  // Get all tenant tenants.
  async getAllTenants() {
    return this.tenantRepository.getAll();
  }

  // Get one tenant profile by id.
  async getTenantById(id) {
    const tenant = await this.tenantRepository.getById(id);
    if (!tenant) {
      throw new BadRequestError("Tenant not found");
    }

    const tenantId = tenant._id?.toString?.() || tenant.id;
    const usersCount = this.usersApi
      ? await this.usersApi.countUsersByTenant(tenantId)
      : 0;

    return {
      ...sanitizeUser(tenant),
      usersCount
    };
  }

  async createTenant(data) {
    const existing = await this.tenantRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestError("Tenant name already in use");
    }
    return this.tenantRepository.createTenant(data);
  }
}
