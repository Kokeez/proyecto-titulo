import React, { useState, useEffect } from 'react';
import { useCart } from './carritoContext';
import { Button, Table, Container, Form } from 'react-bootstrap';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendedorId, setVendedorId] = useState('');
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    // Obtener la lista de vendedores
    fetch('http://localhost:8000/api/vendedores/')  // Ajusta la URL si es necesario
      .then(res => res.json())
      .then(data => setVendedores(data))
      .catch(err => setError('Error al cargar vendedores'));
  }, []);

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
            quantity: i.quantity,
            type: i.product.type === 'servicio' ? 'servicio' : 'producto', // Añadir el tipo
          })),
          vendedor: vendedorId,
        }),
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
      <h1>Carro</h1>
      {items.length === 0
        ? <p>No hay productos y servicios en el carro.</p>
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

            {/* Dropdown para seleccionar un vendedor */}
            <Form.Group controlId="vendedorSelect">
              
              <Form.Control as="select" value={vendedorId} onChange={e => setVendedorId(e.target.value)}>
                <option value="">Seleccione un vendedor</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </Form.Control>
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <Button onClick={handleCheckout} disabled={loading}>
              {loading ? 'Procesando...' : 'Finalizar Compra'}
            </Button>
          </>
        )}
    </Container>
  );
}
