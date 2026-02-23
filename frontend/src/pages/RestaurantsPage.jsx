import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants } from '../api/restaurantApi';
import { getOrderingHoursLabel, isOrderingOpen } from '../utils/orderingHours';

const descriptions = {
  'The Coop': 'Student Union · Gluten-free & halal',
  'Earth Wok and Fire': 'Bowls, entrees & sides',
  'Sambazon Acai Bowls': 'Small & regular bowls',
  'Pompeii Oven': 'Union Street · Pizza, subs & pasta',
  'Tostada Grill': 'Union Street · Burritos & bowls',
  'Soup & Mac': 'Union Street · Soups & mac and cheese'
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getRestaurants()
      .then((res) => setRestaurants(res.data || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <section className="hero">
        <h1><span>Campus</span> Cravings</h1>
        <p>Order from campus spots, faster and easier.</p>
      </section>

      <main className="page">
        <h2 className="section-title">Order from</h2>
        {error && <p className="error">{error}</p>}
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} className="restaurant-card">
              <p className="restaurant-card-name">{restaurant.name}</p>
              <p className="restaurant-card-desc">{descriptions[restaurant.name] || restaurant.description || restaurant.location || 'Campus dining'}</p>
              <p className="restaurant-hours">
                Ordering hours: {getOrderingHoursLabel(restaurant.name)}
              </p>
              <p className={`restaurant-status ${isOrderingOpen(restaurant.name) ? 'open' : 'closed'}`}>
                {isOrderingOpen(restaurant.name) ? 'Open now' : 'Closed now'}
              </p>
              <span className="restaurant-card-cta">View menu →</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
