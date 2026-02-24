// JSON schema for creating a tenant.
export const tenantCreateSchema = {
  type: 'object',
  required: ['name', 'slug', 'industry', 'status', 'plan', 'max_devices', 'max_metrics_seconds', 'contact_email'],
  properties: {
    name: { type: 'string' },
    slug: { type: 'string' },
    industry: { type: 'string' },
    status: { anyOf: [{ type: 'boolean' }, { type: 'number' }] },
    plan: { anyOf: [{ type: 'boolean' }, { type: 'number' }] },
    max_devices: { type: 'number' },
    max_metrics_seconds: { type: 'number' },
    contact_email: { type: 'string', format: 'email' },
  },
};
