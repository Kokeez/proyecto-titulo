import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link }          from 'react-router-dom';
import {
  Breadcrumb,
  Container,
  Row,
  Col,
  Card,
  Button
} from 'react-bootstrap';
import { CartContext }  from './carritoContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './detalle_producto.css';
import { toast }  from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [prod, setProd]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [qty, setQty]         = useState(1);

  // accede a la función addItem de tu contexto
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    fetch(`http://localhost:8000/api/producto/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => setProd(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Container className="pt-5 text-center">Cargando…</Container>;
  if (error)   return <Container className="pt-5 text-center text-danger">{error}</Container>;

  // total para mostrar
  const total = prod.precio * qty;

  // función que dispara la adición al carrito
  const handleAddToCart = () => {
    addItem({
      id:     prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen_url: prod.imagen_url
    }, qty);
// se agrega toast para que se vea mas bonito
    toast.success(
        `${prod.nombre} x${qty} agregado al carrito — Total: ${new Intl.NumberFormat('es-CL',{
          style:'currency',currency:'CLP',minimumFractionDigits:0
        }).format(prod.precio * qty)}`,
        { autoClose: 3000 }
      )
    }

  return (
    <Container fluid className="product-detail py-4">
      {/* Breadcrumb */}
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Casa</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/productos' }}>Productos</Breadcrumb.Item>
            <Breadcrumb.Item active>{prod.nombre}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Contenido */}
      <Row>
        {/* Imagen */}
        <Col lg={6} className="mb-4">
          {prod.imagen_url
            ? <Card.Img
                src={prod.imagen_url}
                alt={prod.nombre}
                className="img-fluid rounded"
                style={{ objectFit: 'cover', height: '400px', width: '100%' }}
              />
            : <div className="placeholder-image" />
          }
        </Col>

        {/* Detalles y compra */}
        <Col lg={6}>
          <h2>{prod.nombre}</h2>
          <p><strong>Cantidad vendidas:</strong> {prod.vendidas ?? 0}</p>
          <p>
            <strong>Total generado:</strong>{' '}
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format((prod.vendidas ?? 0) * prod.precio)}
          </p>

          <div className="d-flex align-items-center mb-3">
            <span className="me-2">Calidad & Reseñas Clientes</span>
            {[...Array(5)].map((_, i) => (
              <span key={i} className="star">★</span>
            ))}
            <small className="text-muted ms-2">438 visitas</small>
          </div>

          <div className="mb-4">
            <Button variant="outline-primary" className="me-2">Ver Producto</Button>
            <Button variant="secondary">Ver Características</Button>
          </div>

          <hr />

          {/* Selector de cantidad */}
          <div className="d-flex align-items-center mb-3">
            <span className="me-3">Cantidad:</span>
            <Button variant="light" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
            <span className="mx-3 qty-display">{qty}</span>
            <Button variant="light" onClick={() => setQty(q => q + 1)}>+</Button>
            <span className="ms-auto total-display">
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(total)}
            </span>
          </div>

          {/* Botón de agregar al carrito */}
          <Button 
            variant="danger" 
            size="lg" 
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;


