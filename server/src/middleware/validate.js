const { body, param, query, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return res.status(400).json({
      success: false,
      message: formattedErrors.map((e) => e.message).join(', '),
      errors: formattedErrors
    });
  }
  next();
};

// Auth Validations
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email').trim().toLowerCase().isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Food Validations
const validateFood = [
  body('name').trim().notEmpty().withMessage('Food item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('image').trim().isURL().withMessage('Valid image URL is required'),
  handleValidationErrors
];

// Order Validations
const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.food').notEmpty().withMessage('Food item ID is required for each order item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  handleValidationErrors
];

// Status Update Validation
const validateStatusUpdate = [
  body('status')
    .isIn(['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'])
    .withMessage('Status must be one of: PLACED, CONFIRMED, PREPARING, PICKED UP, DELIVERED'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateFood,
  validateOrder,
  validateStatusUpdate
};
