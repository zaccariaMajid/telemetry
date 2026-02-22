// Builds HTTP handlers using injected dependencies.
export const buildTenantController = ({ tenantService }) => ({
  // GET /tenants
  getAllTenants: async (req, reply) => {
    const tenants = await tenantService.getAllTenants();
    return reply.send(tenants);
  },

  // GET /tenants/:id
  getTenantById: async (req, reply) => {
    const tenant = await tenantService.getTenantById(req.params.id);
    return reply.send(tenant);
  },

  // POST /tenants
  createTenant: async (req, reply) => {
    const tenant = await tenantService.createTenant(req.body);
    return reply.send(tenant);
  }
});
