import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cancelOrder, getMyOrders } from '../api/orderApi';

export default function OrdersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loadingOrderId, setLoadingOrderId] = useState('');
  const checkoutStatus = new URLSearchParams(location.search).get('checkout');

  async function loadOrders() {
    if (!user) return;
    try {
      const res = await getMyOrders(user.id);
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [user]);

  async function onCancelOrder(orderId) {
    setError('');
    setLoadingOrderId(orderId);
    try {
      await cancelOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOrderId('');
    }
  }

  if (!user) {
    return <main className="container"><p>Please login to view orders.</p></main>;
  }

  return (
    <main className="container">
      <h1>My Orders</h1>
      {checkoutStatus === 'success' && <p className="success">Payment completed successfully.</p>}
      {error && <p className="error">{error}</p>}
      <div className="list">
        {orders.map((order) => (
          <div className="row" key={order.id}>
            <div>
              <strong>Order {order.id.slice(0, 8)}...</strong>
              <p>Status: {order.status}</p>
              <p>Payment: {order.payment_status}</p>
              <p>
                Subtotal: ${Number(order.subtotal_price || 0).toFixed(2)} | Delivery: $
                {Number(order.delivery_fee || 0).toFixed(2)}
              </p>
              <p>Deliver to: {order.delivery_name} · {order.delivery_phone}</p>
              <p>{order.delivery_address}</p>
              {order.delivery_instructions && <p>Notes: {order.delivery_instructions}</p>}
            </div>
            <div className="order-right">
              <span>${Number(order.total_price).toFixed(2)}</span>
              {order.status === 'pending' && order.payment_status !== 'paid' && (
                <button disabled={loadingOrderId === order.id} onClick={() => onCancelOrder(order.id)}>
                  {loadingOrderId === order.id ? 'Canceling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
