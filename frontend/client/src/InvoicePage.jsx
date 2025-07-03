// src/Invoice.jsx
import React, { useState, useEffect } from 'react';
import { useParams }      from 'react-router-dom';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';

export default function Invoice() {
  const { boletaId } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch(`http://localhost:8000/api/boletas/${boletaId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la boleta');
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [boletaId]);

  if (loading) return <Container className="py-5 text-center"><Spinner/></Container>;
  if (error)   return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2>Boleta #{data.id}</h2>
      <p><strong>Fecha:</strong> {new Date(data.fecha_venta).toLocaleString()}</p>
      <p><strong>Vendedor:</strong> {data.vendedor.nombre}</p>
      <p><strong>Tipo:</strong> {data.tipo}</p>
      <Table bordered>
        <thead>
          <tr>
            <th>Producto</th><th>Cantidad</th><th>Precio U.</th><th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.detalles.map(d => (
            <tr key={d.id}>
              <td>{d.producto_nombre || d.servicio_nombre}</td>
              <td>{d.cantidad}</td>
              <td>{d.precio_unitario}</td>
              <td>{d.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h4 className="text-end">Total: {data.total}</h4>
      <div className="text-center mt-4">
        <Button onClick={() => window.print()}>Imprimir Boleta</Button>
      </div>
    </Container>
  );
}

