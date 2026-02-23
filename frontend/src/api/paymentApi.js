import { apiRequest } from './client';

export function createCheckoutSession(orderId) {
  return apiRequest('/payments/checkout-session', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  });
}

export function refundOrder(orderId) {
  return apiRequest(`/payments/orders/${orderId}/refund`, {
    method: 'PATCH'
  });
}
