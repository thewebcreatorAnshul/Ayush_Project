const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../middleware/auth');

const generateAdminToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// @desc    Admin dedicated login
// @route   POST /api/admin/auth/login
// @access  Public (Enforces admin role check on backend)
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide administrator email and password',
        errors: ['Missing credentials']
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials',
        errors: ['Invalid email or password']
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials',
        errors: ['Invalid email or password']
      });
    }

    // STRICT RBAC CHECK: User MUST have 'admin' role in database
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Account does not have administrator privileges.',
        errors: ['Forbidden: Customer account cannot access admin panel']
      });
    }

    const token = generateAdminToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Public
const adminLogout = async (req, res) => {
  res.json({
    success: true,
    message: 'Admin session terminated successfully'
  });
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private (Admin Only)
const adminGetMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator privileges required.',
        errors: ['Unauthorized']
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  adminGetMe
};
