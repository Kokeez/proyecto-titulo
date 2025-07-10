import React, { useState, useEffect } from 'react';
import { Link, useNavigate }            from 'react-router-dom';
import { Table, Button, Container, Image, Form, Row, Col } from 'react-bootstrap';
import { toast }                        from 'react-toastify';

export default function ProductList2() {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Carga inicial de productos
  useEffect(() => {
    fetch('http://localhost:8000/api/productos/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error cargando productos');
        return res.json();
      })
      .then(setProductos)
      .catch(() => toast.error('Error al cargar productos'));
  }, []);

  // Filtrado por búsqueda
  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = page * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`http://localhost:8000/api/productos/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
    });
    if (res.ok) {
      setProductos(p => p.filter(x => x.id !== id));
      toast.success('Producto eliminado');
    } else {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Container className="py-4">
      {/* Encabezado y buscador */}
      <Row className="mb-3 align-items-center">
        <Col md={4} sm={12} className="mb-2 mb-md-0">
          <h1 className="m-0">Gestion Productos</h1>
        </Col>
        <Col md={4} sm={12} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
          />
        </Col>
        <Col md={4} sm={12} className="text-md-end">
          <Button
            as={Link}
            to="/productos/nuevo"
            variant="primary"
          >
            Nuevo Producto
          </Button>
        </Col>
      </Row>

      {/* Tabla de productos */}
      <Table striped hover responsive>
        <thead>
          <tr>
            <th style={{ width: 80 }}>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Descripción</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map(p => (
            <tr key={p.id}>
              <td>
                {p.imagen_url ? (
                  <Image
                    src={p.imagen_url}
                    alt={p.nombre}
                    rounded
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#e0e0e0' }}/>
                )}
              </td>
              <td>{p.nombre}</td>
              <td>
                {new Intl.NumberFormat('es-CL',{
                  style: 'currency', currency:'CLP', minimumFractionDigits:0
                }).format(p.precio)}
              </td>
              <td>{p.descripcion}</td>
              <td>{p.cantidad_disponible}</td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => navigate(`/productos/${p.id}/editar`)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Controles de paginación */}
      <Row className="mt-3">
        <Col className="d-flex justify-content-between align-items-center">
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span>Página {page + 1} de {totalPages}</span>
          <Button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

