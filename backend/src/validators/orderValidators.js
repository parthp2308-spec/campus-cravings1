const { body, param } = require('express-validator');

const createOrderValidator = [
  body('userId').isUUID().withMessage('userId must be UUID'),
  body('restaurantId').isUUID().withMessage('restaurantId must be UUID'),
  body('deliveryName')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('deliveryName must be 2-120 characters'),
  body('deliveryPhone')
    .trim()
    .isLength({ min: 7, max: 30 })
    .withMessage('deliveryPhone must be 7-30 characters'),
  body('deliveryAddress')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('deliveryAddress must be 5-255 characters'),
  body('deliveryInstructions')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 400 })
    .withMessage('deliveryInstructions must be at most 400 characters'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.menuItemId').isUUID().withMessage('items[].menuItemId must be UUID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('items[].quantity must be >= 1')
];

const userIdParamValidator = [
  param('userId').isUUID().withMessage('userId must be UUID')
];

const restaurantIdParamValidator = [
  param('id').isUUID().withMessage('restaurant id must be UUID')
];

const orderIdParamValidator = [
  param('id').isUUID().withMessage('order id must be UUID')
];

const updateOrderStatusValidator = [
  ...orderIdParamValidator,
  body('status').isIn(['pending', 'accepted', 'out_for_delivery', 'completed', 'canceled']).withMessage('invalid status')
];

module.exports = {
  createOrderValidator,
  userIdParamValidator,
  restaurantIdParamValidator,
  orderIdParamValidator,
  updateOrderStatusValidator
};
