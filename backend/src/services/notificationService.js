const nodemailer = require('nodemailer');
const twilio = require('twilio');
const env = require('../config/env');

const transporter =
  env.smtpHost && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass
        }
      })
    : null;

const twilioClient =
  env.twilioAccountSid && env.twilioAuthToken ? twilio(env.twilioAccountSid, env.twilioAuthToken) : null;

function buildEventMessage(eventType, context) {
  const orderShort = String(context.orderId).slice(0, 8);
  const restaurant = context.restaurantName || 'Restaurant';

  switch (eventType) {
    case 'ORDER_PLACED':
      return `Order ${orderShort} placed at ${restaurant}. Total: $${Number(context.totalPrice || 0).toFixed(2)}.`;
    case 'ORDER_ACCEPTED':
      return `Order ${orderShort} was accepted by ${restaurant}.`;
    case 'ORDER_OUT_FOR_DELIVERY':
      return `Order ${orderShort} is out for delivery from ${restaurant}.`;
    case 'ORDER_COMPLETED':
      return `Order ${orderShort} was delivered. Enjoy your meal.`;
    case 'ORDER_CANCELED':
      return `Order ${orderShort} was canceled.`;
    case 'ORDER_REFUNDED':
      return `Order ${orderShort} refund processed for $${Number(context.totalPrice || 0).toFixed(2)}.`;
    default:
      return `Order update for ${orderShort}.`;
  }
}

async function sendEmail(toEmail, subject, message) {
  if (!transporter || !toEmail || !env.notificationsFromEmail) return;
  await transporter.sendMail({
    from: env.notificationsFromEmail,
    to: toEmail,
    subject,
    text: message
  });
}

async function sendSms(toNumber, message) {
  if (!twilioClient || !toNumber || !env.twilioFromNumber) return;
  await twilioClient.messages.create({
    to: toNumber,
    from: env.twilioFromNumber,
    body: message
  });
}

async function sendOrderNotification(eventType, context) {
  const message = buildEventMessage(eventType, context);
  const subject = `Campus Cravings: ${eventType.replaceAll('_', ' ')}`;

  const jobs = [
    sendEmail(context.userEmail, subject, message),
    sendSms(context.deliveryPhone, message)
  ];

  await Promise.allSettled(jobs);
}

module.exports = {
  sendOrderNotification
};
