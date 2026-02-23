const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, asyncHandler(authController.register));
router.post('/login', loginValidator, validateRequest, asyncHandler(authController.login));

module.exports = router;
