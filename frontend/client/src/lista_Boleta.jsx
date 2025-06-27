import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const BoletaList = () => {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      // Si no está logueado, lo enviamos al login
      navigate('/login');
      return;
    }

    fetch("http://localhost:8000/api/boletas/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          throw new Error("No autorizado");
        }
        if (!res.ok) throw new Error("Error al cargar boletas");
        return res.json();
      })
      .then((data) => setBoletas(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Función para actualizar el estado de la boleta
  const handleUpdateEstado = (id, estado) => {
    const token = localStorage.getItem('access');
    fetch(`http://localhost:8000/api/boletas/${id}/`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar estado");
        return res.json();
      })
      .then(() => {
        // Actualizar el estado de la boleta localmente
        setBoletas((prev) => prev.map((b) =>
          b.id === id ? { ...b, estado } : b
        ));
        toast.success('Estado de boleta actualizado');
      })
      .catch((err) => toast.error(err.message));
  };

  if (loading) return <Container>Cargando...</Container>;
  if (error) return <Container className="text-danger">{error}</Container>;

  return (
    <Container>
      <h2>Boletas</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha Venta</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {boletas.map((boleta) => (
            <tr key={boleta.id}>
              <td>{boleta.id}</td>
              <td>{boleta.fecha_venta}</td>
              <td>{new Intl.NumberFormat('es-CL', {
                style: 'currency', currency: 'CLP'
              }).format(boleta.total)}</td>
              <td>{boleta.estado}</td>
              <td>
                {boleta.estado === "Pendiente" && (
                  <Button
                    variant="success"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pagada')}
                  >
                    Marcar como Pagada
                  </Button>
                )}
                {boleta.estado === "Pagada" && (
                  <Button
                    variant="warning"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pendiente')}
                  >
                    Marcar como Pendiente
                  </Button>
                )}
                {boleta.estado === "Anulada" && (
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateEstado(boleta.id, 'Pendiente')}
                  >
                    Marcar como Pendiente
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default BoletaList;
