const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined!');
    }
    return 'development_fallback_jwt_secret_key_2026_antigravity';
  }
  return secret;
};

/**
 * authenticateUser (protect)
 * Verifies the JWT Bearer token in headers.
 * Extracts the user ID, queries the MongoDB database for the live user record,
 * and attaches the sanitized user object (with live role from DB) to req.user.
 */
const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing Bearer token.',
      errors: ['No authorization token provided']
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Always read fresh user & role from the database — never trust client-provided claims
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        errors: ['User record not found']
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      errors: ['Token validation failed']
    });
  }
};

/**
 * requireRole(...allowedRoles)
 * Middleware factory that enforces strict role-based access control (RBAC).
 * Checks the database-verified role on req.user against permitted roles.
 */
const requireRole = (...allowedRoles) => {
  const flattened = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying permissions.',
        errors: ['Unauthenticated request']
      });
    }

    const userRole = req.user.role || 'customer';

    if (!flattened.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: [${flattened.join(', ')}]. Current role: '${userRole}'.`,
        errors: ['Forbidden: Insufficient privileges']
      });
    }

    next();
  };
};

// Standard role helpers
const requireAdmin = requireRole('admin');
const requireCustomer = requireRole('customer', 'user');

module.exports = {
  authenticateUser,
  protect: authenticateUser,
  requireRole,
  requireAdmin,
  requireCustomer,
  admin: requireAdmin,
  getJwtSecret
};
