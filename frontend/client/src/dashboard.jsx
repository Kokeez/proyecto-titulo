import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {   Container, Tabs, Tab, Spinner, Alert, Card, Modal, Button} from 'react-bootstrap';

export default function Dashboard() {
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeKey, setActiveKey]       = useState('diario');
  const [recommendation, setRecommendation] = useState(null);
  const [recError, setRecError]             = useState('');
  const [showRecModal, setShowRecModal]     = useState(false);

  const token = localStorage.getItem('access');
  const handleOpenModal  = () => setShowRecModal(true);
  const handleCloseModal = () => setShowRecModal(false);
  // 1) Fetch de estadísticas
  useEffect(() => {
    fetch('http://localhost:8000/api/estadisticas-ventas/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status} al cargar estadísticas`);
        return res.json();
      })
      .then(data => {
        setStats(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // 2) Fetch de recomendación del día
  useEffect(() => {
    fetch('http://localhost:8000/api/recomendacion/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status} al cargar recomendación`);
        return res.json();
      })
      .then(data => {
        setRecommendation(data);         // ¡aquí!
      })
      .catch(err => {
        setRecError(err.message);
      });
  }, [token]);

  if (loading) return <Container className="py-5 text-center"><Spinner/></Container>;
  if (error)   return <Container className="py-5 text-danger text-center">{error}</Container>;

  const enrich = (arr, keyDate) =>
    arr.map(item => ({
      name:      new Date(item[keyDate]).toLocaleDateString('es-CL'),
      total:     item.total,
      unidades:  item.unidades,
      boletas:   item.boletas,
      ticketProm: item.boletas ? item.total / item.boletas : 0,
    }));
  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Dashboard de Ventas</h1>

      <Tabs
        id="dashboard-tabs"
        activeKey={activeKey}
        onSelect={k => setActiveKey(k)}
        className="mb-4"
      >
        {/* Diario */}
        <Tab eventKey="diario" title="Diario">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Métricas Diarias</h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={enrich(stats.ventas_dias,'dia')}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis yAxisId="clp" orientation="left"/>
                <YAxis yAxisId="count" orientation="right"/>
                <Tooltip formatter={(v,name) =>
                  (name==='total'||name==='ticketProm')
                    ? new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(v)
                    : v
                }/>
                <Legend verticalAlign="top"/>
                <Bar yAxisId="clp"    dataKey="total"     name="Total CLP"       fill="#8884d8"/>
                <Bar yAxisId="count"  dataKey="unidades"  name="Unidades vendidas" fill="#82ca9d"/>
                <Bar yAxisId="count"  dataKey="boletas"   name="Boletas"          fill="#ffc658"/>
                <Bar yAxisId="clp"    dataKey="ticketProm" name="Ticket Promedio"   fill="#d0ed57"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Tab>

        {/* Mensual */}
        <Tab eventKey="mensual" title="Mensual">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Métricas Mensuales</h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={enrich(stats.ventas_meses,'mes')}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis yAxisId="clp" orientation="left"/>
                <YAxis yAxisId="count" orientation="right"/>
                <Tooltip formatter={(v,name) =>
                  (name==='total'||name==='ticketProm')
                    ? new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(v)
                    : v
                }/>
                <Legend verticalAlign="top"/>
                <Bar yAxisId="clp"    dataKey="total"     name="Total CLP"       fill="#8884d8"/>
                <Bar yAxisId="count"  dataKey="unidades"  name="Unidades vendidas" fill="#82ca9d"/>
                <Bar yAxisId="count"  dataKey="boletas"   name="Boletas"          fill="#ffc658"/>
                <Bar yAxisId="clp"    dataKey="ticketProm" name="Ticket Promedio"   fill="#d0ed57"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Tab>

        {/* Anual */}
        <Tab eventKey="anual" title="Anual">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Métricas Anuales</h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={enrich(stats.ventas_anual,'anio')}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis yAxisId="clp" orientation="left"/>
                <YAxis yAxisId="count" orientation="right"/>
                <Tooltip formatter={(v,name) =>
                  (name==='total'||name==='ticketProm')
                    ? new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(v)
                    : v
                }/>
                <Legend verticalAlign="top"/>
                <Bar yAxisId="clp"    dataKey="total"     name="Total CLP"       fill="#8884d8"/>
                <Bar yAxisId="count"  dataKey="unidades"  name="Unidades vendidas" fill="#82ca9d"/>
                <Bar yAxisId="count"  dataKey="boletas"   name="Boletas"          fill="#ffc658"/>
                <Bar yAxisId="clp"    dataKey="ticketProm" name="Ticket Promedio"   fill="#d0ed57"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Tab>

        {/* Por Tipo */}
        <Tab eventKey="tipo" title="Por Tipo">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas por Tipo</h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.ventas_tipo.map(item=>({
                  name: item.boleta__tipo,
                  total: item.total,
                  unidades: item.unidades,
                  boletas: item.boletas,
                  ticketProm: item.boletas ? item.total/item.boletas : 0
              }))}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis yAxisId="clp" orientation="left"/>
                <YAxis yAxisId="count" orientation="right"/>
                <Tooltip formatter={(v,name) =>
                  (name==='total'||name==='ticketProm')
                    ? new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(v)
                    : v
                }/>
                <Legend verticalAlign="top"/>
                <Bar yAxisId="clp"    dataKey="total"     name="Total CLP"       fill="#8884d8"/>
                <Bar yAxisId="count"  dataKey="unidades"  name="Unidades vendidas" fill="#82ca9d"/>
                <Bar yAxisId="count"  dataKey="boletas"   name="Boletas"          fill="#ffc658"/>
                <Bar yAxisId="clp"    dataKey="ticketProm" name="Ticket Promedio"   fill="#d0ed57"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Tab>

        {/* Por Vendedor */}
        <Tab eventKey="vendedor" title="Por Vendedor">
          <Card className="p-3 shadow-sm">
            <h5 className="text-center">Ventas por Vendedor</h5>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.ventas_vendedor.map(item=>({
                  name: item.boleta__vendedor__nombre,
                  total: item.total,
                  unidades: item.unidades,
                  boletas: item.boletas,
                  ticketProm: item.boletas ? item.total/item.boletas : 0
              }))}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis yAxisId="clp" orientation="left"/>
                <YAxis yAxisId="count" orientation="right"/>
                <Tooltip formatter={(v,name) =>
                  (name==='total'||name==='ticketProm')
                    ? new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(v)
                    : v
                }/>
                <Legend verticalAlign="top"/>
                <Bar yAxisId="clp"    dataKey="total"     name="Total CLP"       fill="#8884d8"/>
                <Bar yAxisId="count"  dataKey="unidades"  name="Unidades vendidas" fill="#82ca9d"/>
                <Bar yAxisId="count"  dataKey="boletas"   name="Boletas"          fill="#ffc658"/>
                <Bar yAxisId="clp"    dataKey="ticketProm" name="Ticket Promedio"   fill="#d0ed57"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Tab>

      </Tabs>

 {/* Recomendación del día */}
      {recError && (
        <Alert variant="danger" className="mt-4 text-center">
          {recError}
        </Alert>
      )}
      {recommendation && (
        <Card className="mt-4 shadow-sm">
          <Card.Body>
            <h5 className="text-center">Recomendación del día</h5>
            <div
              className="text-center"
              // si quieres respetar saltos de línea Markdown:
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {recommendation.contenido}
            </div>
          </Card.Body>
        </Card>
      )}
      {/* Modal de Recomendación */}
      <Modal show={showRecModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recomendación del día</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ whiteSpace: 'pre-wrap' }}>
          {recommendation ? recommendation.contenido : 'Cargando...'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

