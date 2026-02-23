import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRestaurants, getRestaurantMenu } from '../api/restaurantApi';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menuApi';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  isAvailable: true
};

export default function AdminMenuPage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadMenu(id) {
    const res = await getRestaurantMenu(id);
    setMenu(res.data || []);
  }

  useEffect(() => {
    getRestaurants()
      .then((res) => {
        const items = res.data || [];
        setRestaurants(items);
        if (items.length > 0) {
          setRestaurantId(items[0].id);
          return loadMenu(items[0].id);
        }
        return null;
      })
      .catch((err) => setError(err.message));
  }, []);

  async function onCreate(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await createMenuItem({
        restaurantId,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        imageUrl: form.imageUrl || null,
        isAvailable: form.isAvailable
      });
      setForm(emptyForm);
      await loadMenu(restaurantId);
      setMessage('Menu item created.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    setError('');
    setMessage('');
    try {
      await deleteMenuItem(id);
      await loadMenu(restaurantId);
      setMessage('Menu item deleted.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailability(item) {
    try {
      await updateMenuItem(item.id, {
        isAvailable: !item.is_available
      });
      await loadMenu(restaurantId);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user || user.role !== 'admin') {
    return <main className="container"><p>Only admin users can edit menu items.</p></main>;
  }

  return (
    <main className="container">
      <h1>Admin Menu Management</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="row" style={{ marginBottom: 12 }}>
        <label htmlFor="restaurantSelect"><strong>Restaurant</strong></label>
        <select
          id="restaurantSelect"
          value={restaurantId}
          onChange={(e) => {
            setRestaurantId(e.target.value);
            loadMenu(e.target.value);
          }}
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <form className="list" onSubmit={onCreate} style={{ marginBottom: 20 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        <input type="number" step="0.01" min="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} required />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((s) => ({ ...s, imageUrl: e.target.value }))} />
        <label>
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((s) => ({ ...s, isAvailable: e.target.checked }))} />
          Available
        </label>
        <button type="submit">Create Menu Item</button>
      </form>

      <div className="list">
        {menu.map((item) => (
          <div className="row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <p>{item.category} • ${Number(item.price).toFixed(2)}</p>
              <p>Available: {item.is_available ? 'Yes' : 'No'}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleAvailability(item)}>
                {item.is_available ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
