import { apiRequest } from './client';

export function createMenuItem(payload) {
  return apiRequest('/menu', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateMenuItem(id, payload) {
  return apiRequest(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteMenuItem(id) {
  return apiRequest(`/menu/${id}`, {
    method: 'DELETE'
  });
}
