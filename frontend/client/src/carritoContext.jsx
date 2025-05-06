import React, { createContext, useState, useContext, useEffect } from 'react';

// AHORA LO EXPORTAMOS
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(curr => {
      const exists = curr.find(i => i.product.id === product.id);
      if (exists) {
        return curr.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...curr, { product, quantity: qty }];
    });
  };

  const removeItem = productId => {
    setItems(curr => curr.filter(i => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook de conveniencia
export function useCart() {
  return useContext(CartContext);
}
