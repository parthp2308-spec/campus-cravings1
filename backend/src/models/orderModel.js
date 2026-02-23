const db = require('../config/db');

async function createOrderWithItems({
  userId,
  restaurantId,
  items,
  status,
  deliveryName,
  deliveryPhone,
  deliveryAddress,
  deliveryInstructions = null,
  subtotalPrice,
  deliveryFee,
  totalPrice,
  paymentStatus = 'pending'
}) {
  return db.withTransaction(async (client) => {
    const orderInsert = await client.query(
      `INSERT INTO orders (
         user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions,
         subtotal_price, delivery_fee, total_price, status, payment_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
      [
        userId,
        restaurantId,
        deliveryName,
        deliveryPhone,
        deliveryAddress,
        deliveryInstructions,
        subtotalPrice,
        deliveryFee,
        totalPrice,
        status,
        paymentStatus
      ]
    );

    const order = orderInsert.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.menuItemId, item.quantity, item.priceAtTime]
      );
    }

    return order;
  });
}

async function getOrderById(orderId) {
  const { rows } = await db.query(
    `SELECT id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at
     FROM orders
     WHERE id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

async function getOrderWithItems(orderId) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const { rows: items } = await db.query(
    `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price_at_time, mi.name
     FROM order_items oi
     JOIN menu_items mi ON mi.id = oi.menu_item_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return { ...order, items };
}

async function getOrdersByUserId(userId) {
  const { rows } = await db.query(
    `SELECT id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function getOrdersByRestaurantId(restaurantId) {
  const { rows } = await db.query(
    `SELECT id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at
     FROM orders
     WHERE restaurant_id = $1
     ORDER BY created_at DESC`,
    [restaurantId]
  );
  return rows;
}

async function updateOrderStatus(orderId, status) {
  const { rows } = await db.query(
    `UPDATE orders
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
    [status, orderId]
  );
  return rows[0] || null;
}

async function attachStripeSession(orderId, sessionId) {
  const { rows } = await db.query(
    `UPDATE orders
     SET stripe_session_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
    [sessionId, orderId]
  );
  return rows[0] || null;
}

async function markPaymentSucceededBySession(sessionId, paymentIntentId = null) {
  const { rows } = await db.query(
    `UPDATE orders
     SET payment_status = 'paid',
         stripe_payment_intent_id = COALESCE($1, stripe_payment_intent_id),
         updated_at = NOW()
     WHERE stripe_session_id = $2
     RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
    [paymentIntentId, sessionId]
  );
  return rows[0] || null;
}

async function markPaymentFailedBySession(sessionId) {
  const { rows } = await db.query(
    `UPDATE orders
     SET payment_status = 'failed', updated_at = NOW()
     WHERE stripe_session_id = $1
     RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
    [sessionId]
  );
  return rows[0] || null;
}

async function markRefunded(orderId, refundId) {
  const { rows } = await db.query(
    `UPDATE orders
     SET status = 'canceled',
         payment_status = 'refunded',
         stripe_refund_id = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, restaurant_id, delivery_name, delivery_phone, delivery_address, delivery_instructions, subtotal_price, delivery_fee, total_price, status, payment_status, stripe_session_id, stripe_payment_intent_id, stripe_refund_id, created_at, updated_at`,
    [refundId, orderId]
  );
  return rows[0] || null;
}

async function getOrderNotificationContext(orderId) {
  const { rows } = await db.query(
    `SELECT
        o.id AS order_id,
        o.user_id,
        o.restaurant_id,
        o.delivery_phone,
        o.total_price,
        u.email AS user_email,
        r.name AS restaurant_name
     FROM orders o
     JOIN users u ON u.id = o.user_id
     JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.id = $1`,
    [orderId]
  );

  return rows[0] || null;
}

module.exports = {
  createOrderWithItems,
  getOrderById,
  getOrderWithItems,
  getOrdersByUserId,
  getOrdersByRestaurantId,
  updateOrderStatus,
  attachStripeSession,
  markPaymentSucceededBySession,
  markPaymentFailedBySession,
  markRefunded,
  getOrderNotificationContext
};
