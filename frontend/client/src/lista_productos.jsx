import React, { useState, useEffect } from "react";
import {
  Card, Button, Row, Col, Form, Container, Spinner
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./lista_productos.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAlternativos, setShowAlternativos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  // Carga productos
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://localhost:8000/api/productos/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if ([401,403].includes(res.status)) {
          navigate("/login");
          throw new Error("No autorizado");
        }
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  // Carga vehículos
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8000/api/vehiculos/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar vehículos");
        return res.json();
      })
      .then(data => setVehicles(data))
      .catch(err => console.error(err));
  }, [token]);

  // Reset paginación al cambiar filtros
  useEffect(() => {
    setPage(0);
  }, [selectedVehicle, selectedType, showAlternativos]);

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

  // Filtrado combinado
  const filtered = products.filter(p => {
    // Vehículo
    if (selectedVehicle && (!p.vehiculo || String(p.vehiculo.id) !== selectedVehicle)) {
      return false;
    }
    // Tipo de producto
    if (selectedType && p.tipo !== selectedType) {
      return false;
    }
    // Solo alternativos
    if (showAlternativos && !p.es_alternativo) {
      return false;
    }
    return true;
  });

  // Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = page * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // Generar opciones de tipo dinámicamente
  const typeOptions = Array.from(new Set(products.map(p => p.tipo))).sort();

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Productos</h1>

      {/* Filtros */}
      <Row className="justify-content-center mb-4">
        {/* Vehículo */}
        <Col xs={12} md={4} className="mb-3">
          <Form.Select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
          >
            <option value="">Todos los vehículos</option>
            {vehicles.map(v => (
              <option key={v.id} value={String(v.id)}>
                {`${v.marca} ${v.modelo} (${v.ano})`}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Tipo de producto */}
        <Col xs={12} md={4} className="mb-3">
          <Form.Select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {typeOptions.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Alternativos */}
        <Col xs={12} md={4} className="d-flex align-items-center mb-3">
          <Form.Check
            type="checkbox"
            label="Solo alternativos"
            checked={showAlternativos}
            onChange={e => setShowAlternativos(e.target.checked)}
          />
        </Col>
      </Row>

      {/* Grid de Productos */}
<Row xs={1} sm={2} md={3} lg={4} className="g-4 justify-content-center">
  {pageItems.map(prod => {
    const imgSrc = prod.imagen_url;  // <-- aquí
    return (
      <Col key={prod.id}>
        <Link to={`/productos/${prod.id}`} style={{ textDecoration: 'none' }}>
          <Card className="h-100 shadow-sm">
            {imgSrc ? (
              <Card.Img
                variant="top"
                src={imgSrc}
                style={{ height: 180, objectFit: 'cover' }}
              />
            ) : (
              <div style={{ height: 180, backgroundColor: '#e0e0e0' }} />
            )}
            <Card.Body className="d-flex flex-column">
              <Card.Title>{prod.nombre}</Card.Title>
              <Card.Text className="mb-3 text-secondary">
                {new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0
                }).format(prod.precio)}
              </Card.Text>
              <Button variant="danger" className="mt-auto">
                Comprar ahora
              </Button>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    );
  })}
</Row>

      {/* Paginación */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <span>Página {page + 1} de {totalPages}</span>
        <Button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
          Siguiente
        </Button>
      </div>
    </Container>
  );
};

export default ProductList;





