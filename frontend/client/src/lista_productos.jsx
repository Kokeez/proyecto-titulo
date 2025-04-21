import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import "./lista_productos.css"; // Asegúrate de tener el archivo CSS correspondiente

const ProductList = () => {
  const [filter, setFilter] = useState({
    type: "",
    year: "",
    brand: "",
  });

  // Datos simulados de productos
  const products = [
    { id: 1, name: "Llanta 16", price: "$15" },
    { id: 2, name: "Retrovisor", price: "$31" },
    { id: 3, name: "Espejo", price: "$12" },
    { id: 4, name: "Asiento", price: "$12" },
    { id: 5, name: "Volante", price: "$10" },
    { id: 6, name: "Logo Tipo", price: "$10" },
    { id: 7, name: "Focos", price: "$12" },
    { id: 8, name: "Retrovisor", price: "$17" },
    { id: 9, name: "Cubre asientos", price: "$15" },
    { id: 10, name: "Aromáticos", price: "$31" },
    { id: 11, name: "Aceite", price: "$12" },
    { id: 12, name: "Parabrisas", price: "$12" },
    { id: 13, name: "Luces led", price: "$10" },
    { id: 14, name: "Adaptador bluetooth", price: "$10" },
    { id: 15, name: "Sensores", price: "$12" },
    { id: 16, name: "Pines", price: "$17" },
  ];

  // Filtrado de productos
  const filteredProducts = products.filter((product) => {
    return (
      (filter.type === "" || product.name.includes(filter.type)) &&
      (filter.year === "" || product.name.includes(filter.year)) &&
      (filter.brand === "" || product.name.includes(filter.brand))
    );
  });

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="product-list-container">
      <h1>Lista de Productos</h1>

      {/* Filtro */}
      <div className="filter mb-4">
        <Form.Group controlId="type" className="me-3">
          <Form.Label>Tipo de Vehículo</Form.Label>
          <Form.Control as="select" name="type" value={filter.type} onChange={handleFilterChange}>
            <option value="">Seleccionar</option>
            <option value="Llanta">Llanta</option>
            <option value="Retrovisor">Retrovisor</option>
            <option value="Espejo">Espejo</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="year" className="me-3">
          <Form.Label>Año</Form.Label>
          <Form.Control as="select" name="year" value={filter.year} onChange={handleFilterChange}>
            <option value="">Seleccionar</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="brand">
          <Form.Label>Marca</Form.Label>
          <Form.Control as="select" name="brand" value={filter.brand} onChange={handleFilterChange}>
            <option value="">Seleccionar</option>
            <option value="Toyota">Toyota</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
          </Form.Control>
        </Form.Group>
      </div>

      {/* Productos */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="product-card">
            <div className="product-image"></div> {/* Imagen placeholder */}
            <Card.Body className="d-flex flex-column justify-content-between">
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>{product.price}</Card.Text>
              <Button variant="danger" className="buy-button">Comprar ahora</Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

