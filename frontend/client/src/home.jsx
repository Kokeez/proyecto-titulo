import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "./home.css";
import repuestosImage from './images/repuesto.jpg';
import serviciosImage from './images/servicios.jpg';

const Home = () => {
    const [featured, setFeatured] = useState([]);
  
    useEffect(() => {
      fetch('http://localhost:8000/api/productos/top/')
        .then(res => res.json())
        .then(setFeatured)
        .catch(err => console.error('Error cargando top products:', err));
    }, []);
  return (
    <div>
      {/* Hero */}
      <section className="hero">
  <h1>Bienvenido a VulcaStock!</h1>
  <div className="row text-center">
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="categoria-box">
        <img src={repuestosImage} alt="Repuestos" className="placeholder-img" />
        <p>Repuestos</p>
      </div>
    </div>
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="categoria-box">
        <img src={serviciosImage} alt="Servicios" className="placeholder-img" />
        <p>Servicios</p>
      </div>
    </div>
  </div>
</section>

      {/* Productos destacados */}
      <section className="destacados py-5">
      <Container>
        <h2 className="text-center mb-4">Productos más vendidos</h2>
        <Row className="g-4">
          {featured.map(prod => (
            <Col md={4} key={prod.id}>
              <Link to={`/productos/${prod.id}`} className="text-decoration-none">
                <Card className="h-100 shadow-sm">
                  {prod.imagen_url && (
                    <Card.Img
                      variant="top"
                      src={prod.imagen_url}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{prod.nombre}</Card.Title>
                    <Card.Text className="flex-grow-1">
                      {prod.descripcion.slice(0, 60)}…
                    </Card.Text>
                    <div className="mt-auto">
                      <strong>
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0
                        }).format(prod.precio)}
                      </strong>
                      <Button variant="danger" size="sm" className="float-end">
                        Ver
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white py-4">
        <Container>
          <Row className="mb-3">
            <Col md={6}>
              <h4>Ayuda</h4>
              <ul className="list-unstyled">
                <li>FAQ</li>
                <li>Servicios Personalizados</li>
                <li>Contáctanos</li>
              </ul>
            </Col>
            <Col md={6}>
              <h4>Otros</h4>
              <ul className="list-unstyled">
                <li>Política de privacidad</li>
                <li>Ubicación</li>
              </ul>
            </Col>
          </Row>
          <div className="social text-center">
            <span>🌐 Instagram / Facebook</span>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Home;

