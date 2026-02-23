const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const {
  createOrderValidator,
  userIdParamValidator,
  restaurantIdParamValidator,
  orderIdParamValidator,
  updateOrderStatusValidator
} = require('../validators/orderValidators');

const router = express.Router();

router.post('/', authenticate, createOrderValidator, validateRequest, asyncHandler(orderController.createOrder));
router.get('/restaurant/:id', authenticate, authorize('restaurant', 'admin'), restaurantIdParamValidator, validateRequest, asyncHandler(orderController.getOrdersByRestaurant));
router.get('/:userId', authenticate, userIdParamValidator, validateRequest, asyncHandler(orderController.getOrdersByUser));
router.patch('/:id/cancel', authenticate, orderIdParamValidator, validateRequest, asyncHandler(orderController.cancelOwnOrder));
router.patch('/:id/status', authenticate, authorize('restaurant', 'admin'), updateOrderStatusValidator, validateRequest, asyncHandler(orderController.updateOrderStatus));

module.exports = router;
