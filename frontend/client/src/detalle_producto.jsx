import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Container,
  Row,
  Col,
  Card,
  Button,
  Form
} from 'react-bootstrap';
import { CartContext } from './carritoContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './detalle_producto.css';
import { toast } from 'react-toastify';
import { useUser } from './UserContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const { addItem } = useContext(CartContext);
  const { user } = useUser();

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
  if (error) return <Container className="pt-5 text-center text-danger">{error}</Container>;

  const total = prod.precio * qty;

  const handleAddToCart = () => {
    addItem({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen_url: prod.imagen_url
    }, qty);
    toast.success(
      `${prod.nombre} x${qty} agregado al carrito — Total: ${new Intl.NumberFormat('es-CL',{
        style:'currency',currency:'CLP',minimumFractionDigits:0
      }).format(total)}`,
      { autoClose: 3000 }
    );
  };

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= prod.cantidad_disponible) {
      setQty(value);
    } else if (value > prod.cantidad_disponible) {
      setQty(prod.cantidad_disponible);
      toast.error(`No puedes agregar más de ${prod.cantidad_disponible} unidades`);
    } else {
      setQty(1);
    }
  };

  return (
    <Container fluid className="product-detail py-4">
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Casa</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/productos' }}>Productos</Breadcrumb.Item>
            <Breadcrumb.Item active>{prod.nombre}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          {prod.imagen_url ? (
            <Card.Img
              src={prod.imagen_url}
              alt={prod.nombre}
              className="img-fluid rounded"
              style={{ objectFit: 'cover', height: '400px', width: '100%' }}
            />
          ) : (
            <div className="placeholder-image" />
          )}
        </Col>

        <Col lg={6}>
          <h2>{prod.nombre}</h2>

          {user && user.rol === 'Administrador' && (
            <>
              <p><strong>Cantidad vendidas:</strong> {prod.vendidas ?? 0}</p>
              <p><strong>Total generado:</strong> {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(prod.total_generado ?? 0)}</p>
            </>
          )}

          <div className="mb-4">
            <h4>Descripción:</h4>
            <p>{prod.descripcion}</p>
          </div>

          <hr />

          <div className="d-flex align-items-center mb-3">
            <span className="me-3">Cantidad:</span>
            <Button variant="light" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
            <Form.Control
              type="number"
              value={qty}
              onChange={handleQtyChange}
              min="1"
              max={prod.cantidad_disponible}
              className="mx-3"
              style={{ width: '80px' }}
            />
            <Button variant="light" onClick={() => setQty(q => Math.min(prod.cantidad_disponible, q + 1))}>+</Button>
            <span className="ms-auto total-display">
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(total)}
            </span>
          </div>

          <Button variant="danger" size="lg" onClick={handleAddToCart}>
            Agregar al carrito
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;




