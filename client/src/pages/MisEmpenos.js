import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MisEmpenos = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [empenos, setEmpenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renovando, setRenovando] = useState(null);

  useEffect(() => {
    loadEmpenos();
  }, []);

  const loadEmpenos = async () => {
    try {
      const response = await api.get('/empenos/mis-empenos');
      setEmpenos(response.data);
    } catch (error) {
      console.error('Error al cargar empeños:', error);
    } finally {
      setLoading(false);
    }
  };

  const renovarEmpeno = async (id) => {
    if (!window.confirm('¿Deseas renovar este empeño por 30 días más pagando solo el interés?')) {
      return;
    }

    setRenovando(id);
    try {
      await api.post(`/empenos/${id}/renovar`);
      alert('Empeño renovado exitosamente');
      loadEmpenos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Error al renovar'));
    } finally {
      setRenovando(null);
    }
  };

  const finalizarEmpeno = async (id) => {
    if (!window.confirm('¿Confirmas que has pagado el monto total y deseas finalizar el empeño?')) {
      return;
    }

    try {
      await api.post(`/empenos/${id}/finalizar`);
      alert('¡Empeño finalizado! Ya puedes retirar tu objeto.');
      loadEmpenos();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Error al finalizar'));
    }
  };

  const getEstadoBadge = (diasRestantes) => {
    if (diasRestantes < 0) return <span className="badge badge-danger">Vencido</span>;
    if (diasRestantes <= 7) return <span className="badge badge-warning">Por vencer</span>;
    return <span className="badge badge-success">Activo</span>;
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">💎 Empeño Inteligente</div>
          <div className="navbar-menu">
            <div className="navbar-user">
              <div className="navbar-user-avatar">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="navbar-user-info">
                <h4>{user?.nombre}</h4>
                <p>{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-outline">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="container">
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline mb-3">
            ← Volver
          </button>

          <div className="dashboard-header fade-in">
            <h1>📦 Mis Empeños</h1>
            <p>Gestiona tus empeños activos y realiza renovaciones</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : empenos.length === 0 ? (
            <div className="card empty-state fade-in">
              <div className="empty-state-icon">📦</div>
              <h3>No tienes empeños activos</h3>
              <p>Solicita una pre-cotización para comenzar</p>
              <button onClick={() => navigate('/solicitar-cotizacion')} className="btn btn-primary mt-3">
                🔍 Solicitar Pre-Cotización
              </button>
            </div>
          ) : (
            <div className="grid grid-2 fade-in">
              {empenos.map((empeno) => (
                <div key={empeno.id_empeno} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                      {empeno.tipo} {empeno.marca}
                    </h3>
                    {getEstadoBadge(empeno.dias_restantes)}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                    {empeno.descripcion}
                  </p>

                  <div style={{ 
                    background: 'var(--light)', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Monto Prestado
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                          ${empeno.monto_prestado?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Interés Mensual
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--warning)' }}>
                          ${empeno.interes?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Total a Pagar
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>
                          ${(empeno.monto_prestado + empeno.interes)?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Días Restantes
                        </p>
                        <p style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: empeno.dias_restantes <= 7 ? 'var(--danger)' : 'var(--info)' 
                        }}>
                          {empeno.dias_restantes} días
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <p>📅 <strong>Inicio:</strong> {new Date(empeno.fecha_inicio).toLocaleDateString()}</p>
                    <p>⏰ <strong>Vencimiento:</strong> {new Date(empeno.fecha_vencimiento).toLocaleDateString()}</p>
                    <p>🔄 <strong>Renovaciones:</strong> {empeno.renovaciones}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => renovarEmpeno(empeno.id_empeno)}
                      className="btn btn-secondary"
                      disabled={renovando === empeno.id_empeno}
                      style={{ flex: 1, fontSize: '13px' }}
                    >
                      {renovando === empeno.id_empeno ? '⏳' : '🔄'} Renovar (${empeno.interes?.toLocaleString()})
                    </button>
                    <button
                      onClick={() => finalizarEmpeno(empeno.id_empeno)}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '13px' }}
                    >
                      ✅ Pagar Total
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisEmpenos;
