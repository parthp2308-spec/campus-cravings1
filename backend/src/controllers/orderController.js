const orderModel = require('../models/orderModel');
const restaurantModel = require('../models/restaurantModel');
const userModel = require('../models/userModel');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { loadAndValidateMenuItems } = require('../services/orderService');
const { isWithinOrderingHours, formatOrderingHours } = require('../utils/orderingHours');
const { sendOrderNotification } = require('../services/notificationService');
const { isAllowedDormCampus, buildDeliveryAddress } = require('../utils/deliveryZones');

async function createOrder(req, res) {
  const {
    userId,
    restaurantId,
    items,
    deliveryName,
    deliveryPhone,
    deliveryCampus,
    deliveryBuilding,
    deliveryRoom,
    deliveryInstructions
  } = req.body;

  if (req.user.role === 'student' && String(req.user.id) !== String(userId)) {
    throw new ApiError(403, 'Students can only place orders for themselves');
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const restaurant = await restaurantModel.getRestaurantById(restaurantId);
  if (!restaurant || !restaurant.is_active) {
    throw new ApiError(404, 'Restaurant not found');
  }
  if (!isAllowedDormCampus(deliveryCampus)) {
    throw new ApiError(400, 'Delivery is available only to supported UConn dorm campuses');
  }
  if (!env.bypassOrderingHours && !isWithinOrderingHours(restaurant.name, env.orderingTimeZone)) {
    throw new ApiError(
      400,
      `${restaurant.name} is currently closed for ordering. Orders are accepted only ${formatOrderingHours(restaurant.name)}.`
    );
  }

  const { items: normalizedItems, subtotalPrice, deliveryFee, totalPrice } = await loadAndValidateMenuItems(
    restaurantId,
    items
  );

  const order = await orderModel.createOrderWithItems({
    userId,
    restaurantId,
    items: normalizedItems,
    status: 'pending',
    deliveryName,
    deliveryPhone,
    deliveryAddress: buildDeliveryAddress({
      campus: deliveryCampus,
      building: deliveryBuilding,
      room: deliveryRoom
    }),
    deliveryInstructions,
    paymentStatus: 'pending',
    subtotalPrice,
    deliveryFee,
    totalPrice
  });

  const notificationContext = await orderModel.getOrderNotificationContext(order.id);
  if (notificationContext) {
    await sendOrderNotification('ORDER_PLACED', {
      orderId: notificationContext.order_id,
      userEmail: notificationContext.user_email,
      deliveryPhone: notificationContext.delivery_phone,
      restaurantName: notificationContext.restaurant_name,
      totalPrice: notificationContext.total_price
    });
  }

  res.status(201).json({
    data: order,
    confirmation: {
      message: 'Order created. Payment required to confirm.',
      orderId: order.id,
      status: order.status,
      paymentStatus: order.payment_status,
      pricing: {
        subtotal: Number(order.subtotal_price),
        deliveryFee: Number(order.delivery_fee),
        total: Number(order.total_price)
      }
    }
  });
}

async function getOrdersByUser(req, res) {
  if (req.user.role === 'student' && String(req.user.id) !== String(req.params.userId)) {
    throw new ApiError(403, 'Students can only view their own orders');
  }

  const orders = await orderModel.getOrdersByUserId(req.params.userId);
  res.json({ data: orders });
}

async function getOrdersByRestaurant(req, res) {
  const orders = await orderModel.getOrdersByRestaurantId(req.params.id);
  res.json({ data: orders });
}

async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!['pending', 'accepted', 'out_for_delivery', 'completed', 'canceled'].includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const existing = await orderModel.getOrderById(req.params.id);
  if (!existing) {
    throw new ApiError(404, 'Order not found');
  }

  const allowedTransitions = {
    pending: ['accepted', 'canceled'],
    accepted: ['out_for_delivery', 'canceled'],
    out_for_delivery: ['completed'],
    completed: [],
    canceled: []
  };

  if (!allowedTransitions[existing.status].includes(status)) {
    throw new ApiError(400, `Invalid status transition from ${existing.status} to ${status}`);
  }

  if ((status === 'accepted' || status === 'completed') && existing.payment_status !== 'paid') {
    throw new ApiError(400, 'Order must be paid before acceptance/completion');
  }

  const updated = await orderModel.updateOrderStatus(req.params.id, status);

  const notificationContext = await orderModel.getOrderNotificationContext(updated.id);
  if (notificationContext) {
    const eventByStatus = {
      accepted: 'ORDER_ACCEPTED',
      out_for_delivery: 'ORDER_OUT_FOR_DELIVERY',
      completed: 'ORDER_COMPLETED',
      canceled: 'ORDER_CANCELED'
    };
    const eventType = eventByStatus[status];
    if (eventType) {
      await sendOrderNotification(eventType, {
        orderId: notificationContext.order_id,
        userEmail: notificationContext.user_email,
        deliveryPhone: notificationContext.delivery_phone,
        restaurantName: notificationContext.restaurant_name,
        totalPrice: notificationContext.total_price
      });
    }
  }

  res.json({ data: updated });
}

async function cancelOwnOrder(req, res) {
  const order = await orderModel.getOrderById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (String(order.user_id) !== String(req.user.id)) {
    throw new ApiError(403, 'You can only cancel your own orders');
  }

  if (order.status !== 'pending') {
    throw new ApiError(400, 'Only pending orders can be canceled');
  }
  if (order.payment_status === 'paid') {
    throw new ApiError(400, 'Paid orders cannot be canceled from app yet');
  }

  const updated = await orderModel.updateOrderStatus(order.id, 'canceled');
  res.json({ data: updated });
}

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrdersByRestaurant,
  updateOrderStatus,
  cancelOwnOrder
};
