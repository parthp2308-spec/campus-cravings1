import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getRestaurants } from '../api/restaurantApi';
import { getOrderingHoursLabel, isOrderingOpen } from '../utils/orderingHours';

export default function CartPage() {
  const { items, subtotal, deliveryFee, total, removeItem } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants().then((res) => setRestaurants(res.data || [])).catch(() => {});
  }, []);

  const singleRestaurantId = useMemo(() => {
    const restaurantIds = [...new Set(items.map((item) => item.restaurant_id))];
    if (restaurantIds.length !== 1) return null;
    return restaurantIds[0];
  }, [items]);

  const orderRestaurant = useMemo(() => {
    if (!singleRestaurantId) return null;
    return restaurants.find((restaurant) => restaurant.id === singleRestaurantId) || null;
  }, [restaurants, singleRestaurantId]);

  const isRestaurantOpen = orderRestaurant ? isOrderingOpen(orderRestaurant.name) : true;
  const canProceedToCheckout = Boolean(items.length && singleRestaurantId);

  return (
    <main className="container">
      <h1>Cart</h1>
      {error && <p className="error">{error}</p>}
      <div className="list">
        {items.map((item) => (
          <div key={item.id} className="row">
            <div>
              <strong>{item.name}</strong>
              <p>Qty: {item.quantity}</p>
            </div>
            <div>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-totals">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Delivery fee: ${deliveryFee.toFixed(2)}</p>
        <h3>Total: ${total.toFixed(2)}</h3>
        <p className="muted-note">Delivery fee is $2.99 for orders under $5.00, otherwise $3.99.</p>
        {orderRestaurant && (
          <p className={`order-window-note ${isRestaurantOpen ? 'open' : 'closed'}`}>
            {orderRestaurant.name} ordering hours: {getOrderingHoursLabel(orderRestaurant.name)} (
            {isRestaurantOpen ? 'Open now' : 'Closed now'})
          </p>
        )}
      </div>
      {!user && (
        <p className="muted-note">
          Please <Link to="/login">login</Link> before checkout.
        </p>
      )}
      <button
        onClick={() => {
          setError('');
          if (!user) {
            navigate('/login');
            return;
          }
          if (!singleRestaurantId) {
            setError('Order must contain items from a single restaurant');
            return;
          }
          navigate('/checkout');
        }}
        disabled={!canProceedToCheckout || !isRestaurantOpen}
      >
        Proceed to Checkout
      </button>
    </main>
  );
}
