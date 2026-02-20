import { findByEmail, createUser } from "./user.repository";

export const registerUser = async (data) => {
  const existingUser = await findByEmail(data.email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  return createUser(data);
};

