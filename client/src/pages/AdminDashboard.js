import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('citas');
  const [citas, setCitas] = useState([]);
  const [empenos, setEmpenos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'citas') {
        const response = await api.get('/citas/todas');
        setCitas(response.data);
      } else {
        const response = await api.get('/empenos/todos');
        setEmpenos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarCita = async (id) => {
    try {
      await api.put(`/citas/${id}/confirmar`);
      alert('Cita confirmada');
      loadData();
    } catch (error) {
      alert('Error al confirmar cita');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: <span className="badge badge-warning">Pendiente</span>,
      confirmada: <span className="badge badge-success">Confirmada</span>,
      cancelada: <span className="badge badge-danger">Cancelada</span>,
      activo: <span className="badge badge-success">Activo</span>,
      finalizado: <span className="badge badge-info">Finalizado</span>,
    };
    return badges[estado] || <span className="badge badge-info">{estado}</span>;
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">💎 Panel Administrativo</div>
          <div className="navbar-menu">
            <div className="navbar-user">
              <div className="navbar-user-avatar">
                👨‍💼
              </div>
              <div className="navbar-user-info">
                <h4>{user?.nombre}</h4>
                <p>Administrador</p>
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
            <h1>🛠️ Panel de Administración</h1>
            <p>Gestiona citas, empeños y usuarios del sistema</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }} className="fade-in">
            <button
              onClick={() => setActiveTab('citas')}
              className={`btn ${activeTab === 'citas' ? 'btn-primary' : 'btn-outline'}`}
            >
              📅 Citas
            </button>
            <button
              onClick={() => setActiveTab('empenos')}
              className={`btn ${activeTab === 'empenos' ? 'btn-primary' : 'btn-outline'}`}
            >
              📦 Empeños
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <>
              {activeTab === 'citas' && (
                <div className="table-container fade-in">
                  <h2 style={{ padding: '20px', fontSize: '20px', fontWeight: '700' }}>
                    Citas Programadas ({citas.length})
                  </h2>
                  {citas.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📅</div>
                      <h3>No hay citas pendientes</h3>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>DNI</th>
                          <th>Contacto</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Objeto</th>
                          <th>Valor</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citas.map((cita) => (
                          <tr key={cita.id_cita}>
                            <td>{cita.usuario_nombre}</td>
                            <td>{cita.dni}</td>
                            <td>{cita.contacto}</td>
                            <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                            <td>{cita.hora}</td>
                            <td>{cita.tipo} {cita.marca}</td>
                            <td>${cita.resultado_valor?.toLocaleString()}</td>
                            <td>{getEstadoBadge(cita.estado)}</td>
                            <td>
                              {cita.estado === 'pendiente' && (
                                <button
                                  onClick={() => confirmarCita(cita.id_cita)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '12px', padding: '6px 12px' }}
                                >
                                  Confirmar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'empenos' && (
                <div className="table-container fade-in">
                  <h2 style={{ padding: '20px', fontSize: '20px', fontWeight: '700' }}>
                    Empeños Registrados ({empenos.length})
                  </h2>
                  {empenos.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <h3>No hay empeños registrados</h3>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>DNI</th>
                          <th>Objeto</th>
                          <th>Monto</th>
                          <th>Interés</th>
                          <th>Inicio</th>
                          <th>Vencimiento</th>
                          <th>Renovaciones</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empenos.map((empeno) => (
                          <tr key={empeno.id_empeno}>
                            <td>{empeno.usuario_nombre}</td>
                            <td>{empeno.dni}</td>
                            <td>{empeno.tipo} {empeno.marca}</td>
                            <td>${empeno.monto_prestado?.toLocaleString()}</td>
                            <td>${empeno.interes?.toLocaleString()}</td>
                            <td>{new Date(empeno.fecha_inicio).toLocaleDateString()}</td>
                            <td>{new Date(empeno.fecha_vencimiento).toLocaleDateString()}</td>
                            <td>{empeno.renovaciones}</td>
                            <td>{getEstadoBadge(empeno.estado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
