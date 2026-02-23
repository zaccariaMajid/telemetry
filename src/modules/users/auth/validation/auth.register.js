// JSON schema for creating a user.
export const userRegisterSchema = {
  type: "object",
  required: ["tenantId", "full_name", "email", "password", "roles", "is_active"],
  properties: {
    tenantId: { type: "string" },
    full_name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 }
  },
};
