const db = require('../config/db');
const ApiError = require('../utils/ApiError');

const STANDARD_DELIVERY_FEE = 3.99;
const SMALL_ORDER_DELIVERY_FEE = 2.99;
const SMALL_ORDER_THRESHOLD = 5.0;

function calculateDeliveryFee(subtotalPrice) {
  return subtotalPrice < SMALL_ORDER_THRESHOLD ? SMALL_ORDER_DELIVERY_FEE : STANDARD_DELIVERY_FEE;
}

async function loadAndValidateMenuItems(restaurantId, requestedItems) {
  const uniqueIds = [...new Set(requestedItems.map((item) => item.menuItemId))];

  const { rows } = await db.query(
    `SELECT id, restaurant_id, name, price, is_available
     FROM menu_items
     WHERE id = ANY($1::uuid[])`,
    [uniqueIds]
  );

  const byId = new Map(rows.map((row) => [row.id, row]));

  const preparedItems = requestedItems.map((requested) => {
    const menuItem = byId.get(requested.menuItemId);

    if (!menuItem) {
      throw new ApiError(400, `Menu item not found: ${requested.menuItemId}`);
    }
    if (String(menuItem.restaurant_id) !== String(restaurantId)) {
      throw new ApiError(400, `Menu item ${menuItem.id} does not belong to restaurant ${restaurantId}`);
    }
    if (!menuItem.is_available) {
      throw new ApiError(400, `Menu item unavailable: ${menuItem.name}`);
    }

    return {
      menuItemId: menuItem.id,
      quantity: requested.quantity,
      priceAtTime: Number(menuItem.price)
    };
  });

  const subtotalRaw = preparedItems.reduce((sum, item) => {
    return sum + item.priceAtTime * item.quantity;
  }, 0);

  const subtotalPrice = Number(subtotalRaw.toFixed(2));
  const deliveryFee = Number(calculateDeliveryFee(subtotalPrice).toFixed(2));
  const totalPrice = Number((subtotalPrice + deliveryFee).toFixed(2));

  return {
    items: preparedItems,
    subtotalPrice,
    deliveryFee,
    totalPrice
  };
}

module.exports = {
  loadAndValidateMenuItems,
  calculateDeliveryFee
};
