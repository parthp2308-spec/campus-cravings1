const express = require('express');
const { body, param } = require('express-validator');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post(
  '/checkout-session',
  authenticate,
  body('orderId').isUUID().withMessage('orderId must be UUID'),
  validateRequest,
  asyncHandler(paymentController.createCheckoutSession)
);

router.patch(
  '/orders/:id/refund',
  authenticate,
  authorize('admin'),
  param('id').isUUID().withMessage('order id must be UUID'),
  validateRequest,
  asyncHandler(paymentController.refundOrder)
);

module.exports = router;
