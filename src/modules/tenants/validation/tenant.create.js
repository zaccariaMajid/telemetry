// JSON schema for creating a tenant.
export const tenantCreateSchema = {
  type: 'object',
  required: ['name', 'email', 'phone'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' }
  }
}
