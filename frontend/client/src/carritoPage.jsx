// src/CartPage.jsx
import React, { useState } from 'react';
import { useCart } from './carritoContext';
import { Button, Table, Container } from 'react-bootstrap';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading]            = useState(false);
  const [error, setError]                = useState(null);

  const total = items.reduce((sum, i) => sum + i.product.precio * i.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('http://localhost:8000/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.product.id,
            quantity: i.quantity
          }))
        })
      });
      if (!resp.ok) throw new Error('Checkout fallido');
      const data = await resp.json();
      clearCart();
      alert(`Compra realizada! Boleta #${data.boleta_id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1>Tu Carrito</h1>
      {items.length === 0
        ? <p>No hay productos en el carrito.</p>
        : (
          <>
            <Table striped>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio U.</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.product.id}>
                    <td>{i.product.nombre}</td>
                    <td>{i.quantity}</td>
                    <td>{i.product.precio}</td>
                    <td>{i.product.precio * i.quantity}</td>
                    <td>
                      <Button variant="danger" size="sm"
                        onClick={() => removeItem(i.product.id)}
                      >Quitar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h4>Total: {total}</h4>
            {error && <p className="text-danger">{error}</p>}
            <Button onClick={handleCheckout} disabled={loading}>
              {loading ? 'Procesando...' : 'Finalizar Compra'}
            </Button>
          </>
        )}
    </Container>
  );
}
