// src/BoletaList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function BoletaList() {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(0);
  const pageSize              = 20;
  const navigate              = useNavigate();

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
        if (res.status === 401 || res.status === 403) {
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
        setBoletas(prev =>
          prev.map(b => (b.id === id ? { ...b, estado } : b))
        );
        toast.success('Estado de boleta actualizado');
      })
      .catch(err => toast.error(err.message));
  };

const handlePrint = (id) => {
  // construimos la URL con hash
  const url = `${window.location.origin}/invoice/${id}`;
  const printWindow = window.open(url, '_blank');

  // al cargar, le decimos que imprima
  printWindow.addEventListener('load', () => {
    printWindow.print();
  });
};

  // Paginación
  const totalPages = Math.ceil(boletas.length / pageSize);
  const start      = page * pageSize;
  const pageItems  = boletas.slice(start, start + pageSize);


  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if (error)   return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-5">
      <h2 className="mb-4">Listado de Boletas</h2>
      <Table striped bordered hover>
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
          {pageItems.map((boleta) => (
            <tr key={boleta.id}>
              <td>{boleta.id}</td>
              <td>{new Date(boleta.fecha_venta).toLocaleString('es-CL')}</td>
              <td>
                {new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0
                }).format(boleta.total)}
              </td>
              <td>{boleta.estado}</td>
              <td>
                {/* Cambio de estado */}
                {boleta.estado === 'Pendiente' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pagada')}
                    className="me-2"
                  >
                    Marcar Pagada
                  </Button>
                )}
                {boleta.estado === 'Pagada' && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pendiente')}
                    className="me-2"
                  >
                    Marcar Pendiente
                  </Button>
                )}
                {boleta.estado === 'Anulada' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pendiente')}
                    className="me-2"
                  >
                    Reactivar
                  </Button>
                )}
                {/* Botón Imprimir */}
                  <Button
                  as={Link}
                  to={`/invoice/${boleta.id}`}
                  variant="primary"
                  size="sm"
                  >
                    Imprimir
                  </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
            {/* Controles de paginación */}
      <div className="d-flex justify-content-between align-items-center">
        <Button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >Anterior</Button>

        <span>Página {page + 1} de {totalPages}</span>

        <Button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >Siguiente</Button>
      </div>
    </Container>
  );
}

