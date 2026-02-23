const restaurantModel = require('../models/restaurantModel');
const ApiError = require('../utils/ApiError');

async function getRestaurants(req, res) {
  const restaurants = await restaurantModel.getAllRestaurants();
  res.json({ data: restaurants });
}

async function getRestaurant(req, res) {
  const restaurant = await restaurantModel.getRestaurantById(req.params.id);
  if (!restaurant || !restaurant.is_active) {
    throw new ApiError(404, 'Restaurant not found');
  }
  res.json({ data: restaurant });
}

async function getRestaurantMenu(req, res) {
  const restaurant = await restaurantModel.getRestaurantById(req.params.id);
  if (!restaurant || !restaurant.is_active) {
    throw new ApiError(404, 'Restaurant not found');
  }
  const menu = await restaurantModel.getRestaurantMenu(req.params.id);
  res.json({ data: menu });
}

module.exports = {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu
};
