import { BadRequestError } from "../../shared/errors/app-error.js";

// Public contract exposed by Tenants module to other modules.
export class TenantsModuleApi {
  constructor(tenantsRepository) {
    this.tenantsRepository = tenantsRepository;
  }

  async getTenantById(tenantId) {
    if (!tenantId) {
      throw new BadRequestError("tenantId is required");
    }
    return this.tenantsRepository.getById(tenantId);
  }
}
