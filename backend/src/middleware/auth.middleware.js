const prisma = require('../db');
const env = require('../config/env');
const { verifyToken } = require('../utils/token.util');

/**
 * Authentication middleware verifying JWT from HTTP-only cookie or Authorization header.
 */
async function authenticate(req, res, next) {
  try {
    // Look for token in cookies first, then Authorization Bearer header
    let token = req.cookies ? req.cookies[env.COOKIE_NAME] : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please sign in.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired session. Please sign in again.',
      });
    }

    // Retrieve active user from database (omit passwordHash)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        ecoBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account not found.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: `Your account is ${user.status.toLowerCase()}. Access denied.`,
      });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware.
 * @param {...string} allowedRoles
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
