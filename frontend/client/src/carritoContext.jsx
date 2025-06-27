import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item, qty = 1) => {
    // extraemos el precio de cualquiera de estas claves:
    const rawPrice = item.precio_base ?? item.precio ?? item.price;
    const price    = parseFloat(rawPrice);
  
    if (!item || isNaN(price) || isNaN(qty) || qty <= 0) {
      console.error("Producto o cantidad inválida:", item, qty);
      return;
    }
  
    const type = item.type === 'servicio' ? 'servicio' : 'producto';
  
    setItems(curr => {
      const exists = curr.find(i => i.product.id === item.id);
      if (exists) {
        return curr.map(i =>
          i.product.id === item.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      // guardamos también price en product para facilitar el render
      return [...curr, { product: { ...item, precio: price }, quantity: qty, type }];
    });
  };

  const removeItem = (productId) => {
    setItems(curr => curr.filter(i => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
