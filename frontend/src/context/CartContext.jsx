import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STANDARD_DELIVERY_FEE = 3.99;
const SMALL_ORDER_DELIVERY_FEE = 2.99;
const SMALL_ORDER_THRESHOLD = 5;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const hasItems = items.length > 0;
  const deliveryFee = hasItems
    ? subtotal < SMALL_ORDER_THRESHOLD
      ? SMALL_ORDER_DELIVERY_FEE
      : STANDARD_DELIVERY_FEE
    : 0;
  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart, subtotal, deliveryFee, total }),
    [items, subtotal, deliveryFee, total]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
