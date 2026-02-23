const { body, param } = require('express-validator');

const menuIdParamValidator = [
  param('id').isUUID().withMessage('menu id must be a UUID')
];

const createMenuItemValidator = [
  body('restaurantId').isUUID().withMessage('restaurantId must be a UUID'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').optional().isString(),
  body('price').isFloat({ gt: 0 }).withMessage('price must be > 0'),
  body('category').trim().notEmpty().withMessage('category is required'),
  body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean')
];

const updateMenuItemValidator = [
  ...menuIdParamValidator,
  body('name').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('price').optional().isFloat({ gt: 0 }),
  body('category').optional().trim().notEmpty(),
  body('imageUrl').optional().isURL(),
  body('isAvailable').optional().isBoolean()
];

module.exports = {
  createMenuItemValidator,
  updateMenuItemValidator,
  menuIdParamValidator
};
