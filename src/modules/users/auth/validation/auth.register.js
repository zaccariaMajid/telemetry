// JSON schema for creating a user.
export const userRegisterSchema = {
  type: "object",
  required: ["full_name", "email", "password"],
  properties: {
    full_name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 }
  },
};
