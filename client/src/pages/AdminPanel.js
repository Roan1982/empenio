import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Estados para diferentes secciones
  const [estadisticas, setEstadisticas] = useState({});
  const [citas, setCitas] = useState([]);
  const [empenos, setEmpenos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [empenosPorVencer, setEmpenosPorVencer] = useState([]);
  const [empenosVencidos, setEmpenosVencidos] = useState([]);
  const [reporteMensual, setReporteMensual] = useState([]);
  const [configuracion, setConfiguracion] = useState({});
  const [busqueda, setBusqueda] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          await loadDashboard();
          break;
        case 'citas':
          const citasRes = await api.get('/citas/todas');
          setCitas(citasRes.data);
          break;
        case 'empenos':
          const empenosRes = await api.get('/empenos/todos');
          setEmpenos(empenosRes.data);
          break;
        case 'usuarios':
          const usuariosRes = await api.get('/admin/usuarios');
          setUsuarios(usuariosRes.data);
          break;
        case 'objetos':
          const objetosRes = await api.get('/admin/objetos');
          setObjetos(objetosRes.data);
          break;
        case 'reportes':
          await loadReportes();
          break;
        case 'configuracion':
          const configRes = await api.get('/admin/configuracion');
          setConfiguracion(configRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const [stats, porVencer, vencidos] = await Promise.all([
        api.get('/admin/estadisticas'),
        api.get('/admin/empenos-por-vencer'),
        api.get('/admin/empenos-vencidos')
      ]);
      
      setEstadisticas(stats.data);
      setEmpenosPorVencer(porVencer.data);
      setEmpenosVencidos(vencidos.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  };

  const loadReportes = async () => {
    try {
      const reporte = await api.get('/admin/reporte-mensual');
      setReporteMensual(reporte.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  const confirmarCita = async (id) => {
    try {
      await api.put(`/citas/${id}/confirmar`);
      alert('✅ Cita confirmada');
      loadData();
    } catch (error) {
      alert('❌ Error al confirmar cita');
    }
  };

  const rechazarCita = async (id, motivo) => {
    try {
      await api.put(`/admin/citas/${id}/rechazar`, { motivo });
      alert('Cita rechazada');
      loadData();
    } catch (error) {
      alert('Error al rechazar cita');
    }
  };

  const cambiarEstadoEmpeno = async (id, estado, notas) => {
    try {
      await api.put(`/admin/empenos/${id}/estado`, { estado, notas });
      alert('Estado actualizado');
      loadData();
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const buscarUsuarios = async (termino) => {
    if (!termino) {
      loadData();
      return;
    }
    try {
      const res = await api.get(`/admin/usuarios/buscar?q=${termino}`);
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      await api.put('/admin/configuracion', configuracion);
      alert('✅ Configuración guardada');
    } catch (error) {
      alert('❌ Error al guardar configuración');
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: <span className="badge badge-warning">⏳ Pendiente</span>,
      confirmada: <span className="badge badge-success">✅ Confirmada</span>,
      cancelada: <span className="badge badge-danger">❌ Cancelada</span>,
      activo: <span className="badge badge-success">✅ Activo</span>,
      finalizado: <span className="badge badge-info">🏁 Finalizado</span>,
      vencido: <span className="badge badge-danger">⚠️ Vencido</span>,
    };
    return badges[estado] || <span className="badge badge-secondary">{estado}</span>;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="dashboard-grid">
      <div className="stats-cards">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{estadisticas.totalUsuarios || 0}</h3>
            <p>Usuarios Registrados</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{estadisticas.empenosActivos || 0}</h3>
            <p>Empeños Activos</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(estadisticas.montoTotal)}</h3>
            <p>Monto Total Prestado</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{estadisticas.citasPendientes || 0}</h3>
            <p>Citas Pendientes</p>
          </div>
        </div>
      </div>

      <div className="alerts-section">
        {empenosVencidos.length > 0 && (
          <div className="alert alert-danger">
            <h4>⚠️ {empenosVencidos.length} Empeños Vencidos</h4>
            <ul>
              {empenosVencidos.slice(0, 5).map(e => (
                <li key={e.id_empeno}>
                  {e.usuario_nombre} - {e.tipo} {e.marca} - {formatCurrency(e.monto_prestado)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {empenosPorVencer.length > 0 && (
          <div className="alert alert-warning">
            <h4>⏰ {empenosPorVencer.length} Empeños por Vencer (7 días)</h4>
            <ul>
              {empenosPorVencer.slice(0, 5).map(e => (
                <li key={e.id_empeno}>
                  {e.usuario_nombre} - Vence: {new Date(e.fecha_vencimiento).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  // Render Citas
  const renderCitas = () => (
    <div className="table-container">
      <div className="table-header">
        <h2>📅 Gestión de Citas ({citas.length})</h2>
      </div>
      
      {citas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No hay citas registradas</h3>
        </div>
      ) : (
        <table className="data-table">
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
                <td>{formatCurrency(cita.resultado_valor)}</td>
                <td>{getEstadoBadge(cita.estado)}</td>
                <td>
                  {cita.estado === 'pendiente' && (
                    <div className="action-buttons">
                      <button
                        onClick={() => confirmarCita(cita.id_cita)}
                        className="btn btn-sm btn-success"
                      >
                        ✅ Confirmar
                      </button>
                      <button
                        onClick={() => {
                          const motivo = prompt('Motivo del rechazo:');
                          if (motivo) rechazarCita(cita.id_cita, motivo);
                        }}
                        className="btn btn-sm btn-danger"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render Empeños
  const renderEmpenos = () => (
    <div className="table-container">
      <div className="table-header">
        <h2>💼 Gestión de Empeños ({empenos.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Crear Empeño
        </button>
      </div>
      
      {empenos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No hay empeños registrados</h3>
        </div>
      ) : (
        <table className="data-table">
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empenos.map((empeno) => (
              <tr key={empeno.id_empeno}>
                <td>{empeno.usuario_nombre}</td>
                <td>{empeno.dni}</td>
                <td>{empeno.tipo} {empeno.marca}</td>
                <td>{formatCurrency(empeno.monto_prestado)}</td>
                <td>{formatCurrency(empeno.interes)}</td>
                <td>{new Date(empeno.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(empeno.fecha_vencimiento).toLocaleDateString()}</td>
                <td>{empeno.renovaciones}</td>
                <td>{getEstadoBadge(empeno.estado)}</td>
                <td>
                  <select
                    onChange={(e) => cambiarEstadoEmpeno(empeno.id_empeno, e.target.value, '')}
                    className="select-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Cambiar estado</option>
                    <option value="activo">Activo</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="vencido">Vencido</option>
                    <option value="recuperado">Recuperado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render Usuarios
  const renderUsuarios = () => (
    <div className="table-container">
      <div className="table-header">
        <h2>👥 Gestión de Usuarios ({usuarios.length})</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por DNI, nombre o email..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarUsuarios(e.target.value);
            }}
            className="form-input"
          />
        </div>
      </div>
      
      {usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No se encontraron usuarios</h3>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Contacto</th>
              <th>Total Empeños</th>
              <th>Empeños Activos</th>
              <th>Deuda Total</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td>{usuario.nombre}</td>
                <td>{usuario.dni}</td>
                <td>{usuario.email}</td>
                <td>{usuario.contacto}</td>
                <td>{usuario.total_empenos}</td>
                <td>{usuario.empenos_activos}</td>
                <td>{formatCurrency(usuario.deuda_total)}</td>
                <td>{new Date(usuario.fecha_registro).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render Reportes
  const renderReportes = () => (
    <div className="reportes-container">
      <h2>📊 Reportes Mensuales</h2>
      
      {reporteMensual.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No hay datos de reportes</h3>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Total Empeños</th>
              <th>Monto Total</th>
              <th>Intereses Total</th>
            </tr>
          </thead>
          <tbody>
            {reporteMensual.map((mes, index) => (
              <tr key={index}>
                <td>{mes.mes}</td>
                <td>{mes.total_empenos}</td>
                <td>{formatCurrency(mes.monto_total)}</td>
                <td>{formatCurrency(mes.intereses_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Render Configuración
  const renderConfiguracion = () => (
    <div className="config-container">
      <h2>⚙️ Configuración del Sistema</h2>
      
      <div className="config-form">
        <div className="form-group">
          <label>Tasa de Interés Mensual (%)</label>
          <input
            type="number"
            value={configuracion.tasa_interes_mensual || ''}
            onChange={(e) => setConfiguracion({...configuracion, tasa_interes_mensual: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Plazo en Días (Default)</label>
          <input
            type="number"
            value={configuracion.plazo_dias_default || ''}
            onChange={(e) => setConfiguracion({...configuracion, plazo_dias_default: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Porcentaje de Préstamo (%)</label>
          <input
            type="number"
            value={configuracion.porcentaje_prestamo || ''}
            onChange={(e) => setConfiguracion({...configuracion, porcentaje_prestamo: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Días de Gracia</label>
          <input
            type="number"
            value={configuracion.dias_gracia || ''}
            onChange={(e) => setConfiguracion({...configuracion, dias_gracia: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Nombre de la Empresa</label>
          <input
            type="text"
            value={configuracion.nombre_empresa || ''}
            onChange={(e) => setConfiguracion({...configuracion, nombre_empresa: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Teléfono de Contacto</label>
          <input
            type="text"
            value={configuracion.telefono_contacto || ''}
            onChange={(e) => setConfiguracion({...configuracion, telefono_contacto: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Email de Contacto</label>
          <input
            type="email"
            value={configuracion.email_contacto || ''}
            onChange={(e) => setConfiguracion({...configuracion, email_contacto: e.target.value})}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            value={configuracion.direccion || ''}
            onChange={(e) => setConfiguracion({...configuracion, direccion: e.target.value})}
            className="form-input"
          />
        </div>

        <button onClick={guardarConfiguracion} className="btn btn-primary">
          💾 Guardar Configuración
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      <nav className="admin-navbar">
        <div className="navbar-brand">
          <span className="brand-icon">💎</span>
          <span className="brand-text">Panel Administrativo</span>
        </div>
        <div className="navbar-user">
          <span>👨‍💼 {user?.nombre}</span>
          <button onClick={logout} className="btn btn-outline-light btn-sm">
            🚪 Salir
          </button>
        </div>
      </nav>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            <span className="sidebar-icon">📅</span>
            <span>Citas</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'empenos' ? 'active' : ''}`}
            onClick={() => setActiveTab('empenos')}
          >
            <span className="sidebar-icon">💼</span>
            <span>Empeños</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            <span className="sidebar-icon">👥</span>
            <span>Usuarios</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'objetos' ? 'active' : ''}`}
            onClick={() => setActiveTab('objetos')}
          >
            <span className="sidebar-icon">📦</span>
            <span>Objetos</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            <span className="sidebar-icon">📈</span>
            <span>Reportes</span>
          </button>

          <button
            className={`sidebar-item ${activeTab === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveTab('configuracion')}
          >
            <span className="sidebar-icon">⚙️</span>
            <span>Configuración</span>
          </button>
        </aside>

        <main className="admin-main">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'citas' && renderCitas()}
              {activeTab === 'empenos' && renderEmpenos()}
              {activeTab === 'usuarios' && renderUsuarios()}
              {activeTab === 'reportes' && renderReportes()}
              {activeTab === 'configuracion' && renderConfiguracion()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
