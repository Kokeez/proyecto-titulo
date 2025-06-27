// src/components/ServiceDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useCart } from './carritoContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/servicios/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error('No se encontró el servicio');
        return res.json();
      })
      .then(data => setService(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (error)   return <Alert variant="danger" className="my-5 text-center">{error}</Alert>;

  // calculamos duración en minutos (basado en el string HH:MM:SS)
  let durMin = 0;
  if (service.duracion_estimada) {
    const parts = service.duracion_estimada.split(':');
    const horas   = parseInt(parts[0],10) || 0;
    const minutos = parseInt(parts[1],10) || 0;
    durMin = horas * 60 + minutos;
  }

  const handleAddToCart = () => { // 15000
  
    const serviceData = {
      id: service.id,
      nombre: service.nombre,
      precio_base: service.precio_base,
      type: 'servicio',
    };
  
    addItem(serviceData, 1);
    navigate('/carrito');
  };

  return (
    <Container className="py-5">
      <Button variant="link" onClick={() => navigate(-1)}>&larr; Volver</Button>
      <Card className="mt-3 shadow-sm">
        <Card.Body>
          <Card.Title>{service.nombre}</Card.Title>
          <Card.Text>
            {service.descripcion || 'Sin descripción.'}
          </Card.Text>
          <Card.Text>
            <strong>Precio: </strong>
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(service.precio_base)}
          </Card.Text>
          {durMin > 0 && (
            <Card.Text>
              <strong>Duración aprox.: </strong> {durMin} minutos
            </Card.Text>
          )}
          <Button variant="success" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ServiceDetail;
