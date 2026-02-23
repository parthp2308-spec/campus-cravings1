const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'restaurant', 'admin']).withMessage('invalid role')
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('valid email is required'),
  body('password').notEmpty().withMessage('password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
