import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Dashboard() {
  const [dataDias, setDataDias] = useState([]);
  const [dataMeses, setDataMeses] = useState([]);
  const [dataTipo, setDataTipo] = useState([]);
  const [dataVendedor, setDataVendedor] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/estadisticas-ventas/')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        return res.json();
      })
      .then(json => {
        const dias = json.ventas_dias.map(item => ({
          name: new Date(item.dia).toLocaleDateString('es-CL'),
          total: item.total
        }));
        const meses = json.ventas_meses.map(item => ({
          name: new Date(item.mes).toLocaleDateString('es-CL', { month:'short', year:'numeric' }),
          total: item.total
        }));
        const tipos = json.ventas_tipo.map(item => ({
          name: item.producto__tipo === 'Venta' ? 'Venta' : 'Servicio',
          total: item.total
        }));
        const vendedores = json.ventas_vendedor.map(item => ({
          name: item.vendedor__nombre,
          total: item.total
        }));

        setDataDias(dias);
        setDataMeses(meses);
        setDataTipo(tipos);
        setDataVendedor(vendedores);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-5 text-center">Cargando dashboard…</Container>;
  if (error) return <Container className="py-5 text-center text-danger">{error}</Container>;

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Dashboard de Ventas</h1>
      <Row className="gy-4">
        {/* Ventas Últimos 7 Días */}
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas Últimos 7 Días</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataDias} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Ventas Mes a Mes */}
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas Mes a Mes</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMeses} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Ventas por Tipo de Producto/Servicio */}
      <Row className="gy-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas por Tipo</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataTipo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Ventas por Vendedor */}
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas por Vendedor</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataVendedor} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#d0ed57" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

