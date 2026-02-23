// JSON schema for creating a user.
export const userRegisterSchema = {
  type: "object",
  required: ["full_name", "email", "password"],
  additionalProperties: false,
  properties: {
    tenantId: { type: "string" },
    // Keep auth input independent from tenants module schema.
    tenant: {
      type: "object",
      additionalProperties: false,
      required: ["name", "slug", "contact_email"],
      properties: {
        name: { type: "string", minLength: 2 },
        slug: { type: "string", minLength: 2 },
        industry: { type: "string" },
        status: { type: "number" },
        plan: { type: "number" },
        max_devices: { type: "number" },
        max_metrics_seconds: { type: "number" },
        contact_email: { type: "string", format: "email" },
      },
    },
    full_name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 }
  },
  anyOf: [{ required: ["tenantId"] }, { required: ["tenant"] }]
};
