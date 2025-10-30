import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Historial.css';

const Historial = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      const response = await api.get('/empenos/historial');
      setHistorial(response.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'finalizado':
      case 'recuperado':
        return 'badge-success';
      case 'vencido':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'finalizado':
        return 'Finalizado';
      case 'recuperado':
        return 'Recuperado';
      case 'vencido':
        return 'Vencido';
      default:
        return estado;
    }
  };

  // Filtrar historial
  const historialFiltrado = historial.filter(empeno => {
    const matchEstado = !filtroEstado || empeno.estado === filtroEstado;
    const matchBusqueda = !busqueda || 
      empeno.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empeno.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empeno.modelo?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchEstado && matchBusqueda;
  });

  const exportarCSV = () => {
    if (historialFiltrado.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha Inicio', 'Fecha Vencimiento', 'Tipo', 'Marca', 'Modelo', 'Monto Prestado', 'Interés', 'Total', 'Estado', 'Renovaciones'];
    const rows = historialFiltrado.map(e => [
      e.fecha_inicio,
      e.fecha_vencimiento,
      e.tipo,
      e.marca,
      e.modelo,
      e.monto_prestado,
      e.interes,
      e.monto_prestado + e.interes,
      e.estado,
      e.renovaciones || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historial_empenos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="historial-container">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Volver
        </button>
        <h1>📊 Historial de Empeños</h1>
        <p>Revisa todos tus empeños finalizados, recuperados y vencidos</p>
      </div>

      {historial.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay historial disponible</h3>
          <p>Aún no tienes empeños finalizados o vencidos</p>
        </div>
      ) : (
        <>
          <div className="filters-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Buscar por tipo, marca o modelo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            <select 
              className="filter-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="finalizado">Finalizado</option>
              <option value="recuperado">Recuperado</option>
              <option value="vencido">Vencido</option>
            </select>

            {(busqueda || filtroEstado) && (
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setBusqueda('');
                  setFiltroEstado('');
                }}
              >
                Limpiar filtros
              </button>
            )}

            <button 
              className="btn-export"
              onClick={exportarCSV}
              disabled={historialFiltrado.length === 0}
            >
              📥 Exportar CSV ({historialFiltrado.length})
            </button>
          </div>

          <div className="historial-stats">
            <div className="stat-item">
              <span className="stat-label">Total Empeños:</span>
              <span className="stat-value">{historial.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Finalizados:</span>
              <span className="stat-value success">{historial.filter(e => e.estado === 'finalizado' || e.estado === 'recuperado').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Vencidos:</span>
              <span className="stat-value danger">{historial.filter(e => e.estado === 'vencido').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mostrando:</span>
              <span className="stat-value">{historialFiltrado.length}/{historial.length}</span>
            </div>
          </div>

          <div className="table-container">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Vencimiento</th>
                  <th>Objeto</th>
                  <th>Monto Prestado</th>
                  <th>Interés</th>
                  <th>Total</th>
                  <th>Renovaciones</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.map((empeno) => (
                  <tr key={empeno.id_empeno}>
                    <td>{empeno.id_empeno}</td>
                    <td>{new Date(empeno.fecha_inicio).toLocaleDateString()}</td>
                    <td>{new Date(empeno.fecha_vencimiento).toLocaleDateString()}</td>
                    <td>
                      <div className="objeto-info">
                        <strong>{empeno.tipo}</strong>
                        <br />
                        <small>{empeno.marca} {empeno.modelo}</small>
                      </div>
                    </td>
                    <td className="money">${empeno.monto_prestado?.toLocaleString()}</td>
                    <td className="money">${empeno.interes?.toLocaleString()}</td>
                    <td className="money strong">${(empeno.monto_prestado + empeno.interes)?.toLocaleString()}</td>
                    <td className="center">{empeno.renovaciones || 0}</td>
                    <td>
                      <span className={`badge ${getEstadoBadgeClass(empeno.estado)}`}>
                        {getEstadoTexto(empeno.estado)}
                      </span>
                      {empeno.estado === 'vencido' && empeno.dias_vencidos > 0 && (
                        <div className="vencido-info">
                          <small>⚠️ {empeno.dias_vencidos} días vencido</small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Historial;
