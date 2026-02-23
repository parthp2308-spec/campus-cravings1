const db = require('../config/db');

async function getAllRestaurants() {
  const { rows } = await db.query(
    `SELECT id, name, description, location, estimated_time, is_active
     FROM restaurants
     WHERE is_active = true
     ORDER BY name ASC`
  );
  return rows;
}

async function getRestaurantById(id) {
  const { rows } = await db.query(
    `SELECT id, name, description, location, estimated_time, is_active
     FROM restaurants
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function getRestaurantMenu(restaurantId) {
  const { rows } = await db.query(
    `SELECT id, restaurant_id, name, description, price, category, image_url, is_available
     FROM menu_items
     WHERE restaurant_id = $1
     ORDER BY category ASC, name ASC`,
    [restaurantId]
  );
  return rows;
}

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu
};
