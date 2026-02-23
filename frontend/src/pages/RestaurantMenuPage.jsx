import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRestaurantMenu, getRestaurants } from '../api/restaurantApi';
import { useCart } from '../context/CartContext';
import { getOrderingHoursLabel, isOrderingOpen } from '../utils/orderingHours';

const heroByName = {
  'The Coop': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2025/08/TheCoop_Logo-scaled.png',
  'Earth Wok and Fire': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2023/12/coverewok.jpg',
  'Sambazon Acai Bowls': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2023/12/Website_header-scaled.jpg',
  'Pompeii Oven': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2023/12/Web_USM_Pompeii.jpg',
  'Tostada Grill': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2023/12/Web_USM_Tostada-1.jpg',
  'Soup & Mac': 'https://dining.media.uconn.edu/wp-content/uploads/sites/125/2023/12/Web_USM_MacCheese_Soup.jpg'
};

const subtitleByName = {
  'The Coop': 'Campus favorite for tenders, wraps, and quick bites.',
  'Earth Wok and Fire': 'Bowls, entrees & sides',
  'Sambazon Acai Bowls': 'Small (12oz) & Regular (16oz)',
  'Pompeii Oven': 'Union Street Market · Pizza, subs & pasta',
  'Tostada Grill': 'Union Street Market · Burritos, salads & bowls',
  'Soup & Mac': 'Union Street Market · Soups & mac and cheese'
};

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants().then((res) => setRestaurants(res.data || [])).catch(() => {});

    getRestaurantMenu(id)
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message));
  }, [id]);

  const restaurant = useMemo(() => restaurants.find((r) => r.id === id), [restaurants, id]);
  const name = restaurant?.name || 'Restaurant Menu';
  const orderingOpen = isOrderingOpen(name);
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const category = item.category || 'Menu';
      if (!map.has(category)) map.set(category, []);
      map.get(category).push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <main className="page">
      <div className="menu-header">
        <Link to="/" className="back-link">← Restaurants</Link>
      </div>

      {heroByName[name] && (
        <section className="restaurant-hero restaurant-hero--compact">
          <img src={heroByName[name]} alt={`${name} banner`} />
          <div className="restaurant-hero-overlay">
            <h1 className="menu-title">{name}</h1>
          </div>
        </section>
      )}

      <div className="menu-header">
        <p className="menu-subtitle">{subtitleByName[name] || restaurant?.description || 'Menu'}</p>
        {restaurant && (
          <p className="menu-hours-note">
            Ordering hours: {getOrderingHoursLabel(name)} · {orderingOpen ? 'Open now' : 'Closed now'}
          </p>
        )}
      </div>

      {name !== 'The Coop' && (
        <p className="live-menu-note">Menus may vary by day. <a href="https://dining.uconn.edu/union-street-market/" target="_blank" rel="noopener">UConn Dining</a></p>
      )}

      {error && <p className="error">{error}</p>}

      {grouped.map(([category, rows]) => (
        <section className="menu-section" key={category}>
          <h2 className="menu-section-heading">{category}</h2>
          <ul className="menu-list">
            {rows.map((item) => (
              <li className="menu-item" key={item.id}>
                <div className="menu-item-left">
                  <span className="menu-item-name">{item.name}</span>
                  {item.description && <div className="desc">{item.description}</div>}
                </div>
                <div className="menu-item-actions">
                  <span className="menu-item-price">${Number(item.price).toFixed(2)}</span>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => addItem(item)}
                    disabled={!orderingOpen}
                    title={orderingOpen ? 'Add to cart' : `${name} is currently closed for ordering`}
                  >
                    {orderingOpen ? 'Add' : 'Closed'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="site-footer">
        <p>© 2026 Campus Cravings · Built at UConn</p>
      </footer>
    </main>
  );
}
