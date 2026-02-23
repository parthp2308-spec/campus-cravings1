const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const restaurantController = require('../controllers/restaurantController');
const { restaurantIdValidator } = require('../validators/restaurantValidators');

const router = express.Router();

router.get('/', asyncHandler(restaurantController.getRestaurants));
router.get('/:id', restaurantIdValidator, validateRequest, asyncHandler(restaurantController.getRestaurant));
router.get('/:id/menu', restaurantIdValidator, validateRequest, asyncHandler(restaurantController.getRestaurantMenu));

module.exports = router;
