import "./lista_productos.css";
// lista_productos.jsx
import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts]     = useState([]);
  const [filter, setFilter]         = useState({ type: "", year: "", brand: "" });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/productos/")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(() => setError("No se pudieron cargar los productos"))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => 
    (filter.type  === "" || p.nombre.includes(filter.type)) &&
    (filter.year  === "" || p.nombre.includes(filter.year)) &&
    (filter.brand === "" || p.nombre.includes(filter.brand))
  );

  if (loading) return <Container className="text-center py-5">Cargando productos…</Container>;
  if (error)   return <Container className="text-center py-5 text-danger">{error}</Container>;

  return (
    <Container className="py-5">
      {/* Título centrado */}
      <h1 className="text-center mb-4">Lista de Productos</h1>

      {/* Filtros */}
      <Row className="justify-content-center mb-5">
        <Col xs={12} md={4} lg={3} className="mb-3">
          <Form.Select
            name="type"
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Tipo de Vehículo</option>
            <option value="Llanta">Llanta</option>
            <option value="Retrovisor">Retrovisor</option>
            {/* … */}
          </Form.Select>
        </Col>
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
          {/* 1. Aquí renderizamos la imagen si existe, sino un placeholder */}
          {prod.imagen_url
            ? <Card.Img
                variant="top"
                src={prod.imagen_url}
                style={{ height: 180, objectFit: 'cover' }}
              />
            : <div style={{
                height: 180,
                backgroundColor: '#e0e0e0'
              }} />
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

