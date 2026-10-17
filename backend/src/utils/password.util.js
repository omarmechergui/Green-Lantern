const argon2 = require('argon2');

/**
 * Hash a plain text password using Argon2id.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,         // 3 iterations
    parallelism: 1,
  });
}

/**
 * Verify a plain text password against an Argon2 hash.
 * @param {string} hash
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
