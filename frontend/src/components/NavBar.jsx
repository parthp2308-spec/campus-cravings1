import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="topbar">
      <Link to="/" className="topbar-logo">Campus <span>Cravings</span></Link>
      <nav className="topbar-nav">
        <Link to="/">Restaurants</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user && (user.role === 'restaurant' || user.role === 'admin') && <Link to="/restaurant-orders">Incoming Orders</Link>}
        {user && user.role === 'admin' && <Link to="/admin/menu">Admin Menu</Link>}
        <Link to="/cart" className="topbar-cart">Cart <span className="cart-count">{itemCount}</span></Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && (
          <div className="logout-wrap">
            <button className="link-btn" onClick={() => setShowLogoutConfirm((prev) => !prev)}>
              Logout
            </button>
            {showLogoutConfirm && (
              <div className="logout-confirm-dropdown">
                <p>Are you sure you want to log out?</p>
                <div className="logout-confirm-actions">
                  <button
                    type="button"
                    className="logout-confirm-yes"
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      logout();
                    }}
                  >
                    Yes, log out
                  </button>
                  <button
                    type="button"
                    className="logout-confirm-cancel"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
