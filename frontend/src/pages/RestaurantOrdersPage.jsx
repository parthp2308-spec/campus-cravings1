import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRestaurants } from '../api/restaurantApi';
import { getRestaurantOrders, updateOrderStatus } from '../api/orderApi';
import { refundOrder } from '../api/paymentApi';

export default function RestaurantOrdersPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionOrderId, setActionOrderId] = useState('');

  useEffect(() => {
    getRestaurants().then((res) => {
      setRestaurants(res.data || []);
      if ((res.data || []).length > 0) setRestaurantId(res.data[0].id);
    }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!restaurantId || !user) return;
    refreshOrders();
  }, [restaurantId, user]);

  async function refreshOrders() {
    setLoading(true);
    try {
      const res = await getRestaurantOrders(restaurantId);
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId, status) {
    try {
      setActionOrderId(orderId);
      await updateOrderStatus(orderId, status);
      await refreshOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionOrderId('');
    }
  }

  async function onRefund(orderId) {
    try {
      setActionOrderId(orderId);
      await refundOrder(orderId);
      await refreshOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionOrderId('');
    }
  }

  if (!user || (user.role !== 'restaurant' && user.role !== 'admin')) {
    return <main className="container"><p>Only restaurant/admin users can view incoming orders.</p></main>;
  }

  return (
    <main className="container">
      <h1>Incoming Orders</h1>
      {error && <p className="error">{error}</p>}
      <div className="row" style={{ marginBottom: 12 }}>
        <label htmlFor="restaurantId"><strong>Restaurant</strong></label>
        <select id="restaurantId" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      {loading && <p>Loading orders...</p>}
      <div className="list">
        {orders.map((order) => (
          <div className="row" key={order.id}>
            <div>
              <strong>Order {order.id.slice(0, 8)}...</strong>
              <p>Status: {order.status} | Payment: {order.payment_status}</p>
              <p>
                Subtotal: ${Number(order.subtotal_price || 0).toFixed(2)} | Delivery: $
                {Number(order.delivery_fee || 0).toFixed(2)}
              </p>
              <p>Total: ${Number(order.total_price).toFixed(2)}</p>
              <p>Customer: {order.delivery_name} · {order.delivery_phone}</p>
              <p>Address: {order.delivery_address}</p>
              {order.delivery_instructions && <p>Notes: {order.delivery_instructions}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => changeStatus(order.id, 'accepted')}
                disabled={
                  actionOrderId === order.id ||
                  order.status !== 'pending' ||
                  order.payment_status !== 'paid'
                }
              >
                Accept
              </button>
              <button
                onClick={() => changeStatus(order.id, 'out_for_delivery')}
                disabled={
                  actionOrderId === order.id ||
                  order.status !== 'accepted' ||
                  order.payment_status !== 'paid'
                }
              >
                Out for Delivery
              </button>
              <button
                onClick={() => changeStatus(order.id, 'completed')}
                disabled={
                  actionOrderId === order.id ||
                  order.status !== 'out_for_delivery' ||
                  order.payment_status !== 'paid'
                }
              >
                Complete
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => onRefund(order.id)}
                  disabled={
                    actionOrderId === order.id ||
                    order.payment_status !== 'paid' ||
                    order.status === 'completed' ||
                    order.status === 'canceled'
                  }
                >
                  Cancel + Refund
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
