import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Dashboard() {
  const [dataDias, setDataDias]     = useState([]);
  const [dataMeses, setDataMeses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/estadisticas_ventas/')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        return res.json();
      })
      .then(json => {
        // transforma fecha a string legible
        const dias = json.ventas_dias.map(item => ({
          name: new Date(item.dia).toLocaleDateString('es-CL'),
          total: item.total
        }));
        const meses = json.ventas_meses.map(item => ({
          name: new Date(item.mes).toLocaleDateString('es-CL', { month:'short', year:'numeric' }),
          total: item.total
        }));
        setDataDias(dias);
        setDataMeses(meses);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-5 text-center">Cargando dashboard…</Container>;
  if (error)   return <Container className="py-5 text-center text-danger">{error}</Container>;

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Dashboard de Ventas</h1>
      <Row className="gy-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas Últimos 7 Días</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataDias} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL',{ style:'currency', currency:'CLP', minimumFractionDigits:0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas Mes a Mes</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataMeses} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => new Intl.NumberFormat('es-CL',{ style:'currency', currency:'CLP', minimumFractionDigits:0 }).format(value)} />
                <Legend />
                <Bar dataKey="total" name="Total CLP" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
