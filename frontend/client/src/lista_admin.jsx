// src/ProductList2.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate }            from 'react-router-dom';
import { Table, Button, Container, Image } from 'react-bootstrap';
import { toast }                        from 'react-toastify';

export default function ProductList2() {
  const [productos, setProductos] = useState([]);
  const navigate                  = useNavigate();

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
      <h1>Productos</h1>
      <Button
        as={Link}
        to="/productos/nuevo"
        className="mb-3"
        variant="primary"
      >
        Nuevo Producto
      </Button>
      <Table striped hover>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Descripcion</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              {/* AQUI va la imagen */}
              <td style={{ width: 100 }}>
                {p.imagen
                  ? <Image
                      src={p.imagen}
                      alt={p.nombre}
                      rounded
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover'
                      }}
                    />
                  : <div style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#e0e0e0'
                    }}/>
                }
              </td>

              <td>{p.nombre}</td>

              <td>
                {new Intl.NumberFormat('es-CL',{
                  style: 'currency',
                  currency:'CLP',
                  minimumFractionDigits:0
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
    </Container>
  );
}

