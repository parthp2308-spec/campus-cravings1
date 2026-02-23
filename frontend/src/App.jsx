import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<RestaurantsPage />} />
        <Route path="/restaurants/:id" element={<RestaurantMenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/restaurant-orders" element={<RestaurantOrdersPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
