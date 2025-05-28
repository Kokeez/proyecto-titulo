// src/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Image,
  Row,
  Col
} from 'react-bootstrap';
import { toast } from 'react-toastify';

export default function ProductForm() {
  const { id } = useParams();         // si existe, estamos editando
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad_disponible: '',
    imagen: null                   // aquí guardamos el File
  });
  const [preview, setPreview] = useState(null); // url para mostrar preview
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/productos/${id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
      .then(res => res.json())
      .then(data => {
        setForm({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          cantidad_disponible: data.cantidad_disponible,
          imagen: null               // no tocamos imagen existente
        });
        setPreview(data.imagen);     // url de la imagen guardada
      })
      .catch(() => toast.error('No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files[0];
      setForm(f => ({ ...f, imagen: file }));
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('nombre', form.nombre);
    data.append('descripcion', form.descripcion);
    data.append('precio', form.precio);
    data.append('cantidad_disponible', form.cantidad_disponible);
    if (form.imagen) {
      data.append('imagen', form.imagen);
    }

    const url = id
      ? `http://localhost:8000/api/productos/${id}/`
      : `http://localhost:8000/api/productos/`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
      body: data
    });

    if (res.ok) {
      toast.success(`Producto ${id ? 'actualizado' : 'creado'} exitosamente`);
      navigate('/productos');
    } else {
      toast.error('Error al guardar el producto');
    }
  };

  if (loading) {
    return <Container className="py-5 text-center">Cargando…</Container>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">{id ? 'Editar' : 'Nuevo'} Producto</h1>
      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
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
          <Col md={6}>
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
          <Col md={6}>
            <Form.Group controlId="cantidad_disponible">
              <Form.Label>Stock disponible</Form.Label>
              <Form.Control
                name="cantidad_disponible"
                type="number"
                value={form.cantidad_disponible}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="imagen">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleChange}
              />
            </Form.Group>
            {preview && (
              <div className="mt-3 text-center">
                <Image
                  src={preview}
                  alt="Preview"
                  rounded
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>
            )}
          </Col>
        </Row>
        <div className="mt-4">
          <Button variant="primary" type="submit">
            Guardar
          </Button>{' '}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
}
