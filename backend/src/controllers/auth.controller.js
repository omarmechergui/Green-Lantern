const prisma = require('../db');
const { hashPassword, verifyPassword } = require('../utils/password.util');
const { generateToken, setAuthCookie, clearAuthCookie } = require('../utils/token.util');

/**
 * Register a new citizen account.
 * Route: POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, fullName, phone, avatar } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);

    // Create user strictly with role CITIZEN
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        avatar,
        role: 'CITIZEN',
        status: 'ACTIVE',
        ecoBalance: 0,
      },
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

    // Generate JWT and set HTTP-only cookie
    const token = generateToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle database unique constraint race conditions (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
}


/**
 * Authenticate existing user and issue session cookie.
 * Route: POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Retrieve user by email (including passwordHash for verification)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Generic 401 response for non-existent users or password mismatch to prevent timing / enumeration attacks
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: `Your account is ${user.status.toLowerCase()}. Access denied.`,
      });
    }

    // Generate JWT and set HTTP-only cookie
    const token = generateToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    // Sanitize user before returning response (never expose passwordHash)
    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      ecoBalance: user.ecoBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: safeUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log out user by clearing the HTTP-only auth cookie.
 * Route: POST /api/auth/logout
 */
async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
}

/**
 * Get profile of currently authenticated user.
 * Route: GET /api/auth/me
 */
async function getMe(req, res) {
  return res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
