const { param } = require('express-validator');

const restaurantIdValidator = [
  param('id').isUUID().withMessage('restaurant id must be UUID')
];

module.exports = {
  restaurantIdValidator
};
