const menuModel = require('../models/menuModel');
const restaurantModel = require('../models/restaurantModel');
const ApiError = require('../utils/ApiError');

async function createMenuItem(req, res) {
  const restaurant = await restaurantModel.getRestaurantById(req.body.restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const item = await menuModel.createMenuItem(req.body);
  res.status(201).json({ data: item });
}

async function updateMenuItem(req, res) {
  const existing = await menuModel.getMenuItemById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Menu item not found');
  }

  const payload = {
    name: req.body.name ?? existing.name,
    description: req.body.description ?? existing.description,
    price: req.body.price ?? existing.price,
    category: req.body.category ?? existing.category,
    imageUrl: req.body.imageUrl ?? existing.image_url,
    isAvailable: req.body.isAvailable ?? existing.is_available
  };

  const updated = await menuModel.updateMenuItem(req.params.id, payload);
  res.json({ data: updated });
}

async function deleteMenuItem(req, res) {
  const deleted = await menuModel.deleteMenuItem(req.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Menu item not found');
  }
  res.status(204).send();
}

module.exports = {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
