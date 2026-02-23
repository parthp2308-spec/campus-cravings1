import { apiRequest } from './client';

export function getRestaurants() {
  return apiRequest('/restaurants');
}

export function getRestaurantMenu(restaurantId) {
  return apiRequest(`/restaurants/${restaurantId}/menu`);
}
