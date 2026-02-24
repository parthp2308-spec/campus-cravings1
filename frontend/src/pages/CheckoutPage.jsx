import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { createCheckoutSession } from '../api/paymentApi';
import { getRestaurants } from '../api/restaurantApi';
import { getOrderingHoursLabel, isOrderingOpen } from '../utils/orderingHours';
import { ALLOWED_DORM_CAMPUSES } from '../utils/deliveryZones';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    campus: '',
    building: '',
    room: '',
    instructions: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants().then((res) => setRestaurants(res.data || [])).catch(() => {});
  }, []);

  const singleRestaurantId = useMemo(() => {
    const ids = [...new Set(items.map((item) => item.restaurant_id))];
    return ids.length === 1 ? ids[0] : null;
  }, [items]);

  const orderRestaurant = useMemo(() => {
    if (!singleRestaurantId) return null;
    return restaurants.find((restaurant) => restaurant.id === singleRestaurantId) || null;
  }, [restaurants, singleRestaurantId]);

  const isRestaurantOpen = orderRestaurant ? isOrderingOpen(orderRestaurant.name) : true;

  async function onCheckout() {
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }
    if (!items.length) {
      setError('Cart is empty');
      return;
    }
    if (!singleRestaurantId) {
      setError('Order must contain items from only one restaurant');
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.campus || !form.building.trim() || !form.room.trim()) {
      setError('Please enter name, phone, dorm campus, building, and room.');
      return;
    }
    if (orderRestaurant && !isRestaurantOpen) {
      setError(`${orderRestaurant.name} is currently closed. Hours: ${getOrderingHoursLabel(orderRestaurant.name)}`);
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        userId: user.id,
        restaurantId: singleRestaurantId,
        deliveryName: form.name.trim(),
        deliveryPhone: form.phone.trim(),
        deliveryCampus: form.campus,
        deliveryBuilding: form.building.trim(),
        deliveryRoom: form.room.trim(),
        deliveryInstructions: form.instructions.trim(),
        items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity }))
      };

      const orderRes = await createOrder(orderPayload);
      const sessionRes = await createCheckoutSession(orderRes.data.id);

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize. Check publishable key.');

      const result = await stripe.redirectToCheckout({ sessionId: sessionRes.data.sessionId });
      if (result.error) {
        throw new Error(result.error.message || 'Unable to redirect to Stripe checkout');
      }

      clearCart();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <Link to="/cart" className="back-link">← Back to cart</Link>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="checkout-grid">
        <div className="checkout-card">
          <h2>Delivery Details</h2>
          <p className="delivery-zone-note">
            We currently deliver only to these UConn dorm campuses.
          </p>
          <div className="delivery-form delivery-form--checkout">
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </label>
            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(xxx) xxx-xxxx"
              />
            </label>
            <label>
              Dorm campus
              <select
                value={form.campus}
                onChange={(e) => setForm((prev) => ({ ...prev, campus: e.target.value }))}
              >
                <option value="">Select a dorm campus</option>
                {ALLOWED_DORM_CAMPUSES.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Building name
              <input
                value={form.building}
                onChange={(e) => setForm((prev) => ({ ...prev, building: e.target.value }))}
                placeholder="Example: Brock Hall"
              />
            </label>
            <label>
              Room number
              <input
                value={form.room}
                onChange={(e) => setForm((prev) => ({ ...prev, room: e.target.value }))}
                placeholder="Example: 214"
              />
            </label>
            <label>
              Delivery instructions (optional)
              <textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))}
                placeholder="Entrance notes, dropoff details, etc."
              />
            </label>
          </div>
        </div>

        <div className="checkout-card checkout-card--summary">
          <h2>Order Summary</h2>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.id} className="checkout-item">
                <span>{item.name} × {item.quantity}</span>
                <strong>${(Number(item.price) * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <p><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
            <p><span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span></p>
            <p className="checkout-grand-total"><span>Total</span><span>${total.toFixed(2)}</span></p>
          </div>

          {orderRestaurant && (
            <p className={`order-window-note ${isRestaurantOpen ? 'open' : 'closed'}`}>
              {orderRestaurant.name} ordering hours: {getOrderingHoursLabel(orderRestaurant.name)} ({isRestaurantOpen ? 'Open now' : 'Closed now'})
            </p>
          )}

          <button onClick={onCheckout} disabled={isLoading || !items.length || !isRestaurantOpen}>
            {isLoading ? 'Processing...' : 'Checkout with Stripe'}
          </button>
        </div>
      </section>
    </main>
  );
}
