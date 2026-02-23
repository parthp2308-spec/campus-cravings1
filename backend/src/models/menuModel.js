const db = require('../config/db');

async function getMenuItemById(id) {
  const { rows } = await db.query(
    `SELECT id, restaurant_id, name, description, price, category, image_url, is_available
     FROM menu_items
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createMenuItem(payload) {
  const { rows } = await db.query(
    `INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url, is_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, restaurant_id, name, description, price, category, image_url, is_available`,
    [
      payload.restaurantId,
      payload.name,
      payload.description,
      payload.price,
      payload.category,
      payload.imageUrl,
      payload.isAvailable
    ]
  );
  return rows[0];
}

async function updateMenuItem(id, payload) {
  const { rows } = await db.query(
    `UPDATE menu_items
     SET name = $1,
         description = $2,
         price = $3,
         category = $4,
         image_url = $5,
         is_available = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, restaurant_id, name, description, price, category, image_url, is_available`,
    [
      payload.name,
      payload.description,
      payload.price,
      payload.category,
      payload.imageUrl,
      payload.isAvailable,
      id
    ]
  );
  return rows[0] || null;
}

async function deleteMenuItem(id) {
  const { rowCount } = await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
