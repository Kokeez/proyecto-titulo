import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

export default function BoletaList() {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(0);
  const pageSize              = 20;
  const navigate              = useNavigate();

  // filtros
  const [fechaFiltro, setFechaFiltro] = useState(''); // yyyy-mm-dd
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://localhost:8000/api/boletas/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if ([401,403].includes(res.status)) {
          navigate('/login');
          throw new Error('No autorizado');
        }
        if (!res.ok) throw new Error('Error al cargar boletas');
        return res.json();
      })
      .then(data => setBoletas(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUpdateEstado = (id, estado) => {
    const token = localStorage.getItem('access');
    fetch(`http://localhost:8000/api/boletas/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar estado');
        return res.json();
      })
      .then(() => {
        setBoletas(prev => prev.map(b => (b.id === id ? { ...b, estado } : b)));
        toast.success('Estado de boleta actualizado');
      })
      .catch(err => toast.error(err.message));
  };

  // Handlers de impresión
  const handlePrint = id => {
    // Abrir la vista de boleta en otra pestaña para imprimir
    navigate(`/invoice/${id}`);
  };

  // aplicar filtros
  const boletasFiltradas = boletas.filter(b => {
    let ok = true;
    if (fechaFiltro) {
      const fechaVenta = new Date(b.fecha_venta).toISOString().substr(0, 10);
      ok = ok && fechaVenta === fechaFiltro;
    }
    if (estadoFiltro) ok = ok && b.estado === estadoFiltro;
    return ok;
  });

  // Paginación
  const totalPages = Math.ceil(boletasFiltradas.length / pageSize);
  const start      = page * pageSize;
  const pageItems  = boletasFiltradas.slice(start, start + pageSize);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if (error)   return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Listado de Boletas</h2>

      {/* Filtros */}
      <Row className="mb-3 g-3">
        <Col md={4} sm={6}>
          <Form.Group controlId="fechaFiltro">
            <Form.Label>Filtrar por Fecha</Form.Label>
            <Form.Control
              type="date"
              value={fechaFiltro}
              onChange={e => { setFechaFiltro(e.target.value); setPage(0); }}
            />
          </Form.Group>
        </Col>
        <Col md={4} sm={6}>
          <Form.Group controlId="estadoFiltro">
            <Form.Label>Filtrar por Estado</Form.Label>
            <Form.Select
              value={estadoFiltro}
              onChange={e => { setEstadoFiltro(e.target.value); setPage(0); }}
            >
              <option value="">Todos</option>
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Anulada">Anulada</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha Venta</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{new Date(b.fecha_venta).toLocaleDateString('es-CL')}</td>
              <td>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(b.total)}</td>
              <td>{b.estado}</td>
              <td>
                {b.estado === 'Pendiente' && (
                  <Button variant="success" size="sm" onClick={() => handleUpdateEstado(b.id, 'Pagada')} className="me-2">
                    Marcar Pagada
                  </Button>
                )}
                {b.estado === 'Pagada' && (
                  <Button variant="warning" size="sm" onClick={() => handleUpdateEstado(b.id, 'Pendiente')} className="me-2">
                    Marcar Pendiente
                  </Button>
                )}
                {b.estado === 'Anulada' && (
                  <Button variant="danger" size="sm" onClick={() => handleUpdateEstado(b.id, 'Pendiente')} className="me-2">
                    Reactivar
                  </Button>
                )}
                <Button variant="primary" size="sm" onClick={() => handlePrint(b.id)}>
                  Ver / Imprimir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center">
        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
        <span>Página {page + 1} de {totalPages}</span>
        <Button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
      </div>
    </Container>
  );
}