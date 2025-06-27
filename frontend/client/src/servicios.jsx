import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Services = () => {
  const [services, setServices]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState('Todos');

  // Define aquí tus categorías de filtro
  const categories = ['Todos', 'Lavado', 'Vulcanización', 'Mantenimiento', 'Accesorios'];

  useEffect(() => {
    fetch('http://localhost:8000/api/servicios/')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando servicios');
        return res.json();
      })
      .then(data => setServices(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtra según el nombre del servicio
  const filtered = services.filter(s => {
    if (filter === 'Todos') return true;
    return s.nombre.toLowerCase().includes(filter.toLowerCase());
  });

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error)   return <p className="text-center text-danger my-5">{error}</p>;

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Servicios</h2>

      {/* Menú de filtros */}
      <div className="d-flex justify-content-center mb-4">
        <ButtonGroup>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={cat === filter ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <Row className="g-4">
        {filtered.map(s => {
          // Cálculo de duración en minutos
          let durMin = 0;
          if (typeof s.duracion_estimada === 'string') {
            const [h, m] = s.duracion_estimada.split(':');
            durMin = (parseInt(h,10)||0) * 60 + (parseInt(m,10)||0);
          } else if (typeof s.duracion_estimada === 'number') {
            durMin = Math.round(s.duracion_estimada / 60);
          }

          return (
            <Col md={4} key={s.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{s.nombre}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    {s.descripcion || 'Sin descripción disponible.'}
                  </Card.Text>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong>
                      {new Intl.NumberFormat('es-CL',{
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0
                      }).format(s.precio_base)}
                    </strong>
                    <Button
                      as={Link}
                      to={`/servicios/${s.id}`}
                      variant="primary"
                      size="sm"
                    >
                      Ver detalle
                    </Button>
                  </div>
                </Card.Body>
                {s.duracion_estimada && (
                  <Card.Footer>
                    <small className="text-muted">
                      Duración aprox. {durMin} minutos
                    </small>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default Services;

