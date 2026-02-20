import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10;

export const generateSalt = async () => {
  return bcrypt.genSalt(SALT_ROUNDS)
}

export const hashPassword = async (password) => {
  const salt = await generateSalt()
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}
