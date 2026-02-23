import { tenantCreateSchema } from "../../../tenants/validation/tenant.create.js";

// JSON schema for creating a user.
export const userRegisterSchema = {
  type: "object",
  required: ["full_name", "email", "password"],
  properties: {
    tenantId: { type: "string" },
    tenant: tenantCreateSchema,
    full_name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 }
  },
  anyOf: [{ required: ["tenantId"] }, { required: ["tenant"] }]
};
