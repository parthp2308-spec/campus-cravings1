import { apiRequest } from './client';

export function createOrder(payload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getMyOrders(userId) {
  return apiRequest(`/orders/${userId}`);
}

export function getRestaurantOrders(restaurantId) {
  return apiRequest(`/orders/restaurant/${restaurantId}`);
}

export function updateOrderStatus(orderId, status) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function cancelOrder(orderId) {
  return apiRequest(`/orders/${orderId}/cancel`, {
    method: 'PATCH'
  });
}
