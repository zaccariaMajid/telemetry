/**
 *
 * @param {Object|null} user - The user object to sanitize.
 * @returns {Object|null} User object without sensitive fields, or null if input is falsy.
 */
export default function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}
