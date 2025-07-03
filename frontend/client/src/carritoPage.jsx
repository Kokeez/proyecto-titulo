import React, { useState, useEffect } from 'react';
import { useCart }          from './carritoContext';
import { Button, Table, Container, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate }      from 'react-router-dom';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading]            = useState(false);
  const [error, setError]                = useState(null);
  const [vendedorId, setVendedorId]      = useState('');
  const [vendedores, setVendedores]      = useState([]);
  const navigate                         = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/vendedores/')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar vendedores');
        return res.json();
      })
      .then(data => setVendedores(data))
      .catch(err => setError(err.message));
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
            // si es servicio…
            ...(i.product.type === 'servicio'
              ? { service_id: i.product.id }
              : { product_id: i.product.id }
    ),
    quantity: i.quantity
  })),
  vendedor_id: vendedorId,        // coincidir con lo que espera el backend
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Checkout fallido');
      }
      const data = await resp.json();
      clearCart();
      navigate(`/invoice/${data.boleta_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1>Tu Carrito</h1>
      {items.length === 0
        ? <Alert variant="info">No hay productos ni servicios en el carrito.</Alert>
        : (
          <>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Producto/Servicio</th>
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
                    <td>{new Intl.NumberFormat('es-CL',{
                          style:'currency',currency:'CLP',minimumFractionDigits:0
                        }).format(i.product.precio)}</td>
                    <td>{new Intl.NumberFormat('es-CL',{
                          style:'currency',currency:'CLP',minimumFractionDigits:0
                        }).format(i.product.precio * i.quantity)}</td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => removeItem(i.product.id)}
                      >Quitar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h4>Total: {new Intl.NumberFormat('es-CL',{
                          style:'currency',currency:'CLP',minimumFractionDigits:0
                        }).format(total)}</h4>

            {/* ——— Aquí está el cambio clave ——— */}
            <Form.Group className="mb-3" controlId="vendedorSelect">
              <Form.Label>Vendedor</Form.Label>
              <Form.Select 
                value={vendedorId} 
                onChange={e => setVendedorId(e.target.value)}
                aria-label="Seleccionar vendedor"
              >
                <option value="">-- Seleccione un vendedor --</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* ————————————————————————————— */}

            {error && <Alert variant="danger">{error}</Alert>}

            <Button 
              onClick={handleCheckout} 
              disabled={loading || !vendedorId}
            >
              {loading ? <Spinner size="sm"/> : 'Finalizar Compra'}
            </Button>
          </>
        )}
    </Container>
  );
}


