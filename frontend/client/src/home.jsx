import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, FormControl, ListGroup } from 'react-bootstrap';
import './home.css';
import repuestosImage from './images/repuesto.jpg';
import serviciosImage from './images/servicios.jpg';
import homeImage from './images/home.jpg';
import lavadoImage from './images/lavado.jpg';

const Home = () => {
  const [featured, setFeatured]     = useState([]);
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList]       = useState(false);
  const navigate                      = useNavigate();

  // Carga productos destacados
  useEffect(() => {
    fetch('http://localhost:8000/api/productos/top/')
      .then(res => res.json())
      .then(setFeatured)
      .catch(err => console.error('Error cargando top products:', err));
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowList(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/productos/search/?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setSuggestions(data);
        setShowList(data.length > 0);
      } catch (err) {
        console.error('Error al buscar productos:', err);
        setSuggestions([]);
        setShowList(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const onSelect = (id) => {
    setShowList(false);
    setQuery('');
    navigate(`/productos/${id}`);
  };


  return (
    <div>
      <section className="hero" style={{ position: 'relative', color: 'white', padding: '80px 0' }}>
        <div className="parallax-background" style={{ backgroundImage: `url(${homeImage})` }} />
        <Container className="text-center" style={{ position: 'relative', zIndex: 2 }}>
          <h1>Bienvenido a VulcaStock!</h1>
          <p className="lead">Sistema de gestion para Cars Integral</p>
          <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
           
            {showList && (
              <ListGroup className="suggestions-list" style={{ position: 'absolute', width: '100%' }}>
                {suggestions.map(s => (
                  <ListGroup.Item
                    key={s.id}
                    action
                    onMouseDown={() => onSelect(s.id)}
                  >
                    {s.nombre}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Container>
      </section>

<section className="servicios py-5">
  <Container>
    <h2 className="text-center mb-4">Servicios</h2>
    <Row xs={1} sm={2} md={3} className="g-4">
      <Col>
      <Card className="shadow-sm">
        {/* Reemplazamos Card.Img por un div con fondo */}
        <div className="card-img-bg" style={{ backgroundImage: `url(${lavadoImage})` }}/>
        <Card.Body>
            <Card.Title>Lavado de Autos</Card.Title>
            <Card.Text>Servicio completo de lavado exterior e interior, con opciones a domicilio para tu comodidad.</Card.Text>
            <Button variant="primary" href="/servicios">Ver más</Button>
            </Card.Body>
            </Card>
            </Col>
            <Col>
        <Card className="shadow-sm">
        <div className="card-img-bg" style={{ backgroundImage: `url(${serviciosImage})` }}/>
          <Card.Body>
            <Card.Title>Servicios de Mantenimiento</Card.Title>
            <Card.Text>
              Mantenimiento preventivo y correctivo para asegurar el óptimo funcionamiento de tu vehículo.
            </Card.Text>
            <Button variant="primary" href="/servicios">Ver más</Button>
          </Card.Body>
        </Card>
      </Col>
      <Col>
        <Card className="shadow-sm">
        <div className="card-img-bg" style={{ backgroundImage: `url(${repuestosImage})` }}/>
          <Card.Body>
            <Card.Title>Accesorios para Vehículos</Card.Title>
            <Card.Text>
              Encuentra una amplia gama de accesorios para personalizar y mejorar tu vehículo.
            </Card.Text>
            <Button variant="primary" href="/servicios">Ver más</Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
</section>


<section className="destacados py-5">
  <Container>
    <h2 className="text-center mb-4">Lo más vendido</h2>
    <Row className="g-4">
      {featured.map(prod => (
        <Col md={4} key={prod.id}>
          <Link to={`/productos/${prod.id}`} className="text-decoration-none">
            <Card className="h-100 shadow-sm">
              {prod.imagen_url && (
                <div
                  className="card-img-bg-180"
                  style={{ backgroundImage: `url(${prod.imagen_url})` }}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{prod.nombre}</Card.Title>
                <Card.Text className="flex-grow-1">
                  {prod.descripcion.slice(0, 60)}…
                </Card.Text>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <strong>
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0
                    }).format(prod.precio)}
                  </strong>
                  <Button variant="danger" size="sm">
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



