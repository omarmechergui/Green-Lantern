const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a signed JWT for an authenticated user.
 * @param {object} payload - { id, role }
 * @returns {string}
 */
function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Verify a JWT and return its decoded payload.
 * Pinning algorithms to ['HS256'] prevents algorithm substitution attacks.
 * @param {string} token
 * @returns {object|null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    return null;
  }
}


/**
 * Calculate cookie expiration time in milliseconds based on JWT_EXPIRES_IN string.
 * @param {string} expiresIn
 * @returns {number}
 */
function getCookieMaxAge(expiresIn) {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Attach the secure HTTP-only authentication cookie to the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
function setAuthCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production';
  const maxAge = getCookieMaxAge(env.JWT_EXPIRES_IN);

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge,
    path: '/',
  });
}

/**
 * Clear the authentication cookie from the response.
 * @param {import('express').Response} res
 */
function clearAuthCookie(res) {
  const isProduction = env.NODE_ENV === 'production';

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
}

module.exports = {
  generateToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
};
