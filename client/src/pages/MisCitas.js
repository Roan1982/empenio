import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MisCitas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    fecha: '',
    hora: '',
    notas: '',
    id_precotizacion: null,
  });

  useEffect(() => {
    loadCitas();
    
    // Si viene desde solicitar cotización
    if (location.state?.nuevaCita && location.state?.resultado) {
      setNuevaCita({
        ...nuevaCita,
        id_precotizacion: location.state.resultado.id_analisis,
      });
      setShowModal(true);
    }
  }, []);

  const loadCitas = async () => {
    try {
      const response = await api.get('/citas/mis-citas');
      setCitas(response.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/citas/solicitar', nuevaCita);
      alert('Cita solicitada exitosamente. Te contactaremos para confirmar.');
      setShowModal(false);
      loadCitas();
      setNuevaCita({ fecha: '', hora: '', notas: '', id_precotizacion: null });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Error al crear cita'));
    }
  };

  const cancelarCita = async (id) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;

    try {
      await api.put(`/citas/${id}/cancelar`);
      alert('Cita cancelada');
      loadCitas();
    } catch (error) {
      alert('Error al cancelar cita');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: <span className="badge badge-warning">Pendiente</span>,
      confirmada: <span className="badge badge-success">Confirmada</span>,
      cancelada: <span className="badge badge-danger">Cancelada</span>,
    };
    return badges[estado] || <span className="badge badge-info">{estado}</span>;
  };

  // Generar horarios disponibles
  const horariosDisponibles = [];
  for (let h = 9; h <= 18; h++) {
    horariosDisponibles.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 18) horariosDisponibles.push(`${h.toString().padStart(2, '0')}:30`);
  }

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

          <div className="dashboard-header fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>📅 Mis Citas</h1>
              <p>Coordina y gestiona tus citas para empeñar objetos</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + Nueva Cita
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : citas.length === 0 ? (
            <div className="card empty-state fade-in">
              <div className="empty-state-icon">📅</div>
              <h3>No tienes citas programadas</h3>
              <p>Solicita una cita para concretar tu empeño</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary mt-3">
                📅 Solicitar Cita
              </button>
            </div>
          ) : (
            <div className="table-container fade-in">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Objeto</th>
                    <th>Valor Estimado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id_cita}>
                      <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                      <td>{cita.hora}</td>
                      <td>
                        {cita.tipo} {cita.marca} {cita.modelo}
                      </td>
                      <td>${cita.resultado_valor?.toLocaleString()}</td>
                      <td>{getEstadoBadge(cita.estado)}</td>
                      <td>
                        {cita.estado === 'pendiente' && (
                          <button
                            onClick={() => cancelarCita(cita.id_cita)}
                            className="btn btn-danger"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Solicitar Nueva Cita</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={nuevaCita.fecha}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="input-group">
                  <label>Hora *</label>
                  <select
                    value={nuevaCita.hora}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar horario...</option>
                    {horariosDisponibles.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Notas adicionales</label>
                  <textarea
                    value={nuevaCita.notas}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                    placeholder="Información adicional que quieras compartir..."
                  />
                </div>

                {location.state?.resultado && (
                  <div style={{ 
                    background: 'var(--light)', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      💰 <strong>Pre-cotización:</strong> ${location.state.resultado.valor_estimado?.toLocaleString()}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      📦 <strong>Monto préstamo:</strong> ${location.state.resultado.monto_prestamo?.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Solicitar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCitas;
