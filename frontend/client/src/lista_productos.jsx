import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./lista_productos.css";
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState({ type: "", year: "", brand: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch("http://localhost:8000/api/productos/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          throw new Error("No autorizado");
        }
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Filtrado con los filtros de tipo, año y marca
  const filteredProducts = products.filter(p =>
    (filter.type === "" || p.type === filter.type) &&
    (filter.year === "" || p.year === filter.year) && 
    (filter.brand === "" || p.brand === filter.brand)
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
        <div>Cargando productos…</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5 text-danger">
        {error}
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Lista de Productos</h1>

      {/* Filtros */}
      <Row className="justify-content-center mb-5">
        <Col xs={12} md={4} lg={3} className="mb-3">
          <Form.Select
            name="type"
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Tipo de Producto/Servicio</option>
            <option value="producto">Producto</option>
            <option value="servicio">Servicio</option>
          </Form.Select>
        </Col>

        {/* Filtro Año */}
        <Col xs={12} md={4} lg={3} className="mb-3">
          <Form.Select
            name="year"
            value={filter.year}
            onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}
          >
            <option value="">Año</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
          </Form.Select>
        </Col>

        {/* Filtro Marca */}
        <Col xs={12} md={4} lg={3} className="mb-3">
          <Form.Select
            name="brand"
            value={filter.brand}
            onChange={e => setFilter(f => ({ ...f, brand: e.target.value }))}
          >
            <option value="">Marca</option>
            <option value="Toyota">Toyota</option>
            <option value="Ford">Ford</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Grid de productos */}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4 justify-content-center">
        {filteredProducts.map(prod => (
          <Col key={prod.id}>
            <Link to={`/productos/${prod.id}`} style={{ textDecoration: 'none' }}>
              <Card className="h-100 shadow-sm">
                {prod.imagen
                  ? <Card.Img variant="top" src={prod.imagen} style={{ height: 180, objectFit: 'cover' }} />
                  : <div style={{ height: 180, backgroundColor: '#e0e0e0' }} />
                }
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{prod.nombre}</Card.Title>
                  <Card.Text className="mb-3 text-secondary">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(prod.precio)}
                  </Card.Text>
                  <Button variant="danger" className="mt-auto">
                    Comprar ahora
                  </Button>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductList;



