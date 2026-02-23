import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await register({ ...form, role: 'student' });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container form-wrap">
      <h1>Create Account</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
        <button type="submit">Register</button>
      </form>
    </main>
  );
}
