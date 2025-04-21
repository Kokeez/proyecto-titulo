import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "./home.css";
import repuestosImage from './images/repuesto.jpg';
import serviciosImage from './images/servicios.jpg';

const Home = () => {
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
          <h2 className="text-center mb-4">Todo en vehículos lo encuentra con nosotros</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <span className="etiqueta-nuevo mb-2">Producto nuevo</span>
                  <div className="placeholder-img mb-3" style={{ height: "150px" }}></div>
                  <Card.Title>Cámara trasera adaptable</Card.Title>
                  <Card.Text>Cámara con sensor de movimiento y pantalla HD para visualizar el retroceso del auto</Card.Text>
                  <Button variant="danger">Comprar ahora</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="placeholder-img mb-3" style={{ height: "150px" }}></div>
                  <Card.Title>Radio táctil</Card.Title>
                  <Card.Text>Última generación en radio para distintos tipos de autos</Card.Text>
                  <Button variant="danger">Comprar ahora</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <span className="etiqueta-nuevo mb-2">Producto nuevo</span>
                  <div className="placeholder-img mb-3" style={{ height: "150px" }}></div>
                  <Card.Title>Frenos eléctricos</Card.Title>
                  <Card.Text>Mayor seguridad con lo último en frenos</Card.Text>
                  <Button variant="danger">Comprar ahora</Button>
                </Card.Body>
              </Card>
            </Col>
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

