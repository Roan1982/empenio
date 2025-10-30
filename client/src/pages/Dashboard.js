import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    empenosActivos: 0,
    cotizacionesPendientes: 0,
    citasProgramadas: 0,
    totalPrestado: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [empenosRes, cotizacionesRes, citasRes] = await Promise.all([
        api.get('/empenos/mis-empenos'),
        api.get('/precotizacion/mis-cotizaciones'),
        api.get('/citas/mis-citas'),
      ]);

      const empenosActivos = empenosRes.data.filter(e => e.estado === 'activo');
      const totalPrestado = empenosActivos.reduce((sum, e) => sum + e.monto_prestado, 0);
      const cotizacionesPendientes = cotizacionesRes.data.filter(c => c.estado === 'pendiente').length;
      // Citas programadas incluye pendientes Y confirmadas
      const citasProgramadas = citasRes.data.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length;

      setStats({
        empenosActivos: empenosActivos.length,
        cotizacionesPendientes,
        citasProgramadas,
        totalPrestado,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="dashboard-header fade-in">
            <h1>¡Bienvenido, {user?.nombre}! 👋</h1>
            <p>Gestiona tus empeños de manera inteligente y rápida</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <>
              <div className="stats-grid fade-in">
                <div className="stat-card">
                  <div className="stat-icon primary">📦</div>
                  <div className="stat-value">{stats.empenosActivos}</div>
                  <div className="stat-label">Empeños Activos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon success">💰</div>
                  <div className="stat-value">${stats.totalPrestado.toLocaleString()}</div>
                  <div className="stat-label">Total Prestado</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning">📋</div>
                  <div className="stat-value">{stats.cotizacionesPendientes}</div>
                  <div className="stat-label">Cotizaciones Pendientes</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon info">📅</div>
                  <div className="stat-value">{stats.citasProgramadas}</div>
                  <div className="stat-label">Citas Programadas</div>
                </div>
              </div>

              <h2 className="section-title fade-in">Acciones Rápidas</h2>
              <div className="quick-actions fade-in">
                <Link to="/solicitar-cotizacion" className="action-card">
                  <div className="action-icon">🔍</div>
                  <div className="action-title">Solicitar Pre-Cotización</div>
                  <div className="action-description">
                    Obtén una estimación del valor de tu objeto con IA
                  </div>
                </Link>

                <Link to="/mis-empenos" className="action-card">
                  <div className="action-icon">📦</div>
                  <div className="action-title">Mis Empeños</div>
                  <div className="action-description">
                    Ver estado de tus empeños y renovar préstamos
                  </div>
                </Link>

                <Link to="/mis-citas" className="action-card">
                  <div className="action-icon">📅</div>
                  <div className="action-title">Mis Citas</div>
                  <div className="action-description">
                    Gestionar citas programadas para empeñar objetos
                  </div>
                </Link>

                <Link to="/historial" className="action-card">
                  <div className="action-icon">📊</div>
                  <div className="action-title">Historial</div>
                  <div className="action-description">
                    Ver historial completo de empeños anteriores
                  </div>
                </Link>
              </div>

              <div className="card fade-in">
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
                  ℹ️ Información Importante
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--light-darker)' }}>
                    ✅ <strong>Pre-cotización online:</strong> Envía fotos y descripción de tu objeto
                  </li>
                  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--light-darker)' }}>
                    🤖 <strong>IA automática:</strong> Estimación inmediata del valor
                  </li>
                  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--light-darker)' }}>
                    📅 <strong>Cita previa:</strong> Coordina tu visita para concretar el empeño
                  </li>
                  <li style={{ padding: '12px 0', borderBottom: '1px solid var(--light-darker)' }}>
                    ⏰ <strong>Plazo:</strong> 30 días para recuperar tu objeto
                  </li>
                  <li style={{ padding: '12px 0' }}>
                    🔄 <strong>Renovación:</strong> Paga solo el interés y extiende 30 días más
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
