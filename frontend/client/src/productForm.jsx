// src/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Form, Button, Image,
  Row, Col, Spinner, Alert
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProductForm() {
  const { id } = useParams();       // si existe, estamos editando
  const navigate = useNavigate();

  // estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad_disponible: '',
    tipo: '',
    es_alternativo: false,
    vehiculo_id: '',
    imagen: null,               // file nuevo
    fecha_agregado: '',         // solo lectura
  });

  // lista de vehículos para el select
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // al montar: si editamos, cargamos datos; siempre cargamos vehículos
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }

    // 1) Carga vehículos
    fetch('http://localhost:8000/api/vehiculos/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVehiculos(data))
      .catch(() => toast.error('No se pudieron cargar vehículos'));

    // 2) Si tenemos ID, cargamos el producto
    if (id) {
      fetch(`http://localhost:8000/api/productos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setForm({
            nombre: data.nombre,
            descripcion: data.descripcion,
            precio: data.precio,
            cantidad_disponible: data.cantidad_disponible,
            tipo: data.tipo,
            es_alternativo: data.es_alternativo,
            vehiculo_id: data.vehiculo?.id || '',
            imagen: null,              // no reemplazamos existente
            fecha_agregado: data.fecha_agregado,
          });
        })
        .catch(() => toast.error('No se pudo cargar el producto'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, navigate]);

  // cambio de inputs
  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'imagen') {
      const file = files[0];
      setForm(f => ({ ...f, imagen: file }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // envío
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('nombre', form.nombre);
    data.append('descripcion', form.descripcion);
    data.append('precio', form.precio);
    data.append('cantidad_disponible', form.cantidad_disponible);
    data.append('tipo', form.tipo);
    data.append('es_alternativo', form.es_alternativo);
    if (form.vehiculo_id) data.append('vehiculo_id', form.vehiculo_id);
    if (form.imagen)      data.append('imagen', form.imagen);

    const url    = id
      ? `http://localhost:8000/api/productos/${id}/`
      : `http://localhost:8000/api/productos/`;
    const method = id ? 'PUT' : 'POST';

    const resp = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`
      },
      body: data
    });

    if (resp.ok) {
      toast.success(`Producto ${id ? 'actualizado' : 'creado'} con éxito`);
      navigate('/productos');
    } else {
      const err = await resp.json().catch(() => ({}));
      setError(err.detail || 'Error al guardar el producto');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" /> Cargando…
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">{id ? 'Editar' : 'Nuevo'} Producto</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          {/* Nombre */}
          <Col md={6}>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          {/* Tipo */}
          <Col md={6}>
            <Form.Group controlId="tipo">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo…</option>
                <option value="Neumático">Neumático</option>
                <option value="Cámara">Cámara</option>
                <option value="Líquido">Líquido</option>
                <option value="Accesorio">Accesorio</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Descripción */}
          <Col md={12}>
            <Form.Group controlId="descripcion">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Precio */}
          <Col md={4}>
            <Form.Group controlId="precio">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                name="precio"
                type="number"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          {/* Stock */}
          <Col md={4}>
            <Form.Group controlId="cantidad_disponible">
              <Form.Label>Stock Disponible</Form.Label>
              <Form.Control
                name="cantidad_disponible"
                type="number"
                value={form.cantidad_disponible}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          {/* Alternativo */}
          <Col md={4} className="d-flex align-items-center">
            <Form.Check
              type="checkbox"
              label="Alternativo"
              name="es_alternativo"
              checked={form.es_alternativo}
              onChange={handleChange}
            />
          </Col>

          {/* Vehículo (marca) */}
          <Col md={6}>
            <Form.Group controlId="vehiculo_id">
              <Form.Label>Vehículo (opcional)</Form.Label>
              <Form.Select
                name="vehiculo_id"
                value={form.vehiculo_id}
                onChange={handleChange}
              >
                <option value="">-- Sin vehículo --</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.ano})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Fecha Agregado (sólo lectura) */}
          {form.fecha_agregado && (
            <Col md={6}>
              <Form.Group controlId="fecha_agregado">
                <Form.Label>Fecha Agregado</Form.Label>
                <Form.Control
                  readOnly
                  value={new Date(form.fecha_agregado)
                    .toLocaleString()}
                />
              </Form.Group>
            </Col>
          )}

          {/* Imagen */}
          <Col md={12}>
            <Form.Group controlId="imagen">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>
            {form.imagen && (
              <div className="mt-3 text-center">
                <Image
                  src={URL.createObjectURL(form.imagen)}
                  rounded
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>
            )}
          </Col>
        </Row>

        {/* Botones */}
        <div className="mt-4">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar'}
          </Button>{' '}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
