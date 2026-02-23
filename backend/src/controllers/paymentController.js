const Stripe = require('stripe');
const env = require('../config/env');
const orderModel = require('../models/orderModel');
const ApiError = require('../utils/ApiError');
const { calculateDeliveryFee } = require('../services/orderService');
const { sendOrderNotification } = require('../services/notificationService');

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

function assertStripeConfigured() {
  if (!stripe) {
    throw new ApiError(500, 'Stripe is not configured. Set STRIPE_SECRET_KEY.');
  }
}

async function createCheckoutSession(req, res) {
  assertStripeConfigured();

  const { orderId } = req.body;
  const order = await orderModel.getOrderWithItems(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (req.user.role === 'student' && String(req.user.id) !== String(order.user_id)) {
    throw new ApiError(403, 'Cannot pay for another user order');
  }

  if (order.payment_status === 'paid') {
    throw new ApiError(400, 'Order already paid');
  }
  if (order.status !== 'pending') {
    throw new ApiError(400, `Cannot checkout an order with status: ${order.status}`);
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(Number(item.price_at_time) * 100),
      product_data: {
        name: item.name
      }
    },
    quantity: item.quantity
  }));

  const subtotal = Number(
    order.items.reduce((sum, item) => sum + Number(item.price_at_time) * Number(item.quantity), 0).toFixed(2)
  );
  const deliveryFee =
    order.delivery_fee === null || order.delivery_fee === undefined
      ? calculateDeliveryFee(subtotal)
      : Number(order.delivery_fee);

  lineItems.push({
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(Number(deliveryFee) * 100),
      product_data: {
        name: 'Delivery fee'
      }
    },
    quantity: 1
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    metadata: {
      orderId: order.id,
      userId: String(order.user_id)
    },
    success_url: `${env.frontendUrl}/orders?checkout=success`,
    cancel_url: `${env.frontendUrl}/cart?checkout=cancel`
  });

  await orderModel.attachStripeSession(order.id, session.id);

  res.status(201).json({
    data: {
      orderId: order.id,
      sessionId: session.id,
      checkoutUrl: session.url
    }
  });
}

async function handleWebhook(req, res) {
  assertStripeConfigured();

  const signature = req.headers['stripe-signature'];
  if (!signature || !env.stripeWebhookSecret) {
    return res.status(400).send('Missing Stripe signature or webhook secret');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await orderModel.markPaymentSucceededBySession(session.id, session.payment_intent || null);
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    await orderModel.markPaymentFailedBySession(session.id);
  }

  res.json({ received: true });
}

async function refundOrder(req, res) {
  assertStripeConfigured();

  const order = await orderModel.getOrderById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  if (order.payment_status !== 'paid') {
    throw new ApiError(400, 'Only paid orders can be refunded');
  }
  if (!order.stripe_payment_intent_id) {
    throw new ApiError(400, 'Missing Stripe payment intent for this order');
  }
  if (order.status === 'completed') {
    throw new ApiError(400, 'Completed orders cannot be refunded from app');
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.stripe_payment_intent_id,
    reason: 'requested_by_customer',
    metadata: {
      orderId: order.id
    }
  });

  const updated = await orderModel.markRefunded(order.id, refund.id);

  const notificationContext = await orderModel.getOrderNotificationContext(order.id);
  if (notificationContext) {
    await sendOrderNotification('ORDER_REFUNDED', {
      orderId: notificationContext.order_id,
      userEmail: notificationContext.user_email,
      deliveryPhone: notificationContext.delivery_phone,
      restaurantName: notificationContext.restaurant_name,
      totalPrice: notificationContext.total_price
    });
  }

  res.json({
    data: {
      order: updated,
      refundId: refund.id,
      refundStatus: refund.status
    }
  });
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  refundOrder
};
