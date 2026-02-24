import { BadRequestError } from "../../shared/errors/app-error.js";

// Business logic for tenant operations.
export class TenantService {
  constructor(tenantRepository, usersApi, redis) {
    // Dependency is injected for testability and decoupling.
    this.tenantRepository = tenantRepository;
    this.usersApi = usersApi;
    this.redis = redis;
  }

  // Get all tenant tenants.
  async getAllTenants() {
    const cacheKey = "tenants_cache";

    if (this.redis) {
      const cachedTenants = await this.redis.get(cacheKey);
      if (cachedTenants) {
        try {
          return JSON.parse(cachedTenants);
        } catch {
          // Ignore malformed cache and fall back to DB.
        }
      }
    }

    const tenants = await this.tenantRepository.getAll();

    if (this.redis) {
      await this.redis.set(cacheKey, JSON.stringify(tenants), { EX: 60 });
    }

    return tenants;
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
      ...tenant,
      usersCount,
    };
  }

  async createTenant(data) {
    const existing = await this.tenantRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestError("Tenant name already in use");
    }
    const tenant = await this.tenantRepository.createTenant(data);
    if (this.redis) {
      await this.redis.del("tenants_cache");
    }
    return tenant;
  }
}
