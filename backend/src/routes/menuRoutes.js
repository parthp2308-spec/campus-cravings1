const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const menuController = require('../controllers/menuController');
const {
  createMenuItemValidator,
  updateMenuItemValidator,
  menuIdParamValidator
} = require('../validators/menuValidators');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('admin'),
  createMenuItemValidator,
  validateRequest,
  asyncHandler(menuController.createMenuItem)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateMenuItemValidator,
  validateRequest,
  asyncHandler(menuController.updateMenuItem)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  menuIdParamValidator,
  validateRequest,
  asyncHandler(menuController.deleteMenuItem)
);

module.exports = router;
