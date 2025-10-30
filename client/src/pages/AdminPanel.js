import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CrearEmpenoModal from '../components/CrearEmpenoModal';
import DetalleObjetoModal from '../components/DetalleObjetoModal';
import DashboardCharts from '../components/DashboardCharts';
import NotificationBell from '../components/NotificationBell';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
  
  // Filtros para Objetos
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Filtros para Empeños
  const [filtroEstadoEmpeno, setFiltroEstadoEmpeno] = useState('');
  
  // Filtros para Citas
  const [filtroEstadoCita, setFiltroEstadoCita] = useState('');
  const [ordenCitas, setOrdenCitas] = useState('fecha_desc'); // fecha_asc, fecha_desc, valor_asc, valor_desc

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCrearEmpenoModal, setShowCrearEmpenoModal] = useState(false);
  const [selectedCitaId, setSelectedCitaId] = useState(null);
  const [empenoToCreate, setEmpenoToCreate] = useState(null);
  const [showDetalleObjetoModal, setShowDetalleObjetoModal] = useState(false);
  const [selectedObjetoId, setSelectedObjetoId] = useState(null);

  useEffect(() => {
    console.log('useEffect triggered, activeTab:', activeTab);
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
          alert('🔥 CARGANDO OBJETOS...');
          const objetosRes = await api.get('/admin/objetos');
          console.log('Objetos recibidos:', objetosRes.data);
          console.log('Total objetos:', objetosRes.data.length);
          alert(`✅ Recibidos ${objetosRes.data.length} objetos`);
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

  // Función para exportar a CSV
  const exportarCSV = (datos, nombreArchivo) => {
    if (!datos || datos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(datos[0]).join(',');
    const rows = datos.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const crearEmpenoDescrita = (citaId) => {
    setSelectedCitaId(citaId);
    setShowCrearEmpenoModal(true);
  };

  const handleEmpenoCreado = (empeno) => {
    console.log('Empeño creado:', empeno);
    loadData(); // Recargar datos
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

  // Función para exportar reporte mensual a PDF
  const exportReportePDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-CO');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('Reporte Mensual de Empeños', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${fechaActual}`, 14, 28);

    // Preparar datos
    const tableData = reporteMensual.map(e => [
      e.id_empeno,
      e.usuario_nombre,
      `${e.tipo} ${e.marca}`,
      formatCurrency(e.monto_prestado),
      formatCurrency(e.interes),
      new Date(e.fecha_inicio).toLocaleDateString('es-CO'),
      e.estado
    ]);

    // Calcular totales
    const totalPrestado = reporteMensual.reduce((sum, e) => sum + parseFloat(e.monto_prestado || 0), 0);
    const totalInteres = reporteMensual.reduce((sum, e) => sum + parseFloat(e.interes || 0), 0);

    // Tabla
    doc.autoTable({
      startY: 35,
      head: [['ID', 'Usuario', 'Objeto', 'Monto', 'Interés', 'Fecha', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      }
    });

    // Totales
    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Empeños: ${reporteMensual.length}`, 14, finalY + 10);
    doc.text(`Monto Total Prestado: ${formatCurrency(totalPrestado)}`, 14, finalY + 17);
    doc.text(`Total Intereses: ${formatCurrency(totalInteres)}`, 14, finalY + 24);

    // Guardar
    doc.save(`reporte_empenos_${fechaActual.replace(/\//g, '-')}.pdf`);
  };

  // Función para exportar datos a Excel
  const exportReporteExcel = () => {
    // Preparar datos de empeños
    const datosEmpenos = empenos.map(e => ({
      'ID': e.id_empeno,
      'Usuario': e.usuario_nombre,
      'DNI': e.usuario_dni,
      'Objeto': `${e.tipo} ${e.marca}`,
      'Monto Prestado': parseFloat(e.monto_prestado || 0),
      'Interés': parseFloat(e.interes || 0),
      'Total a Pagar': parseFloat(e.monto_prestado || 0) + parseFloat(e.interes || 0),
      'Fecha Inicio': new Date(e.fecha_inicio).toLocaleDateString('es-CO'),
      'Fecha Vencimiento': new Date(e.fecha_vencimiento).toLocaleDateString('es-CO'),
      'Estado': e.estado
    }));

    // Preparar resumen
    const totalPrestado = empenos.reduce((sum, e) => sum + parseFloat(e.monto_prestado || 0), 0);
    const totalInteres = empenos.reduce((sum, e) => sum + parseFloat(e.interes || 0), 0);
    const empenosActivos = empenos.filter(e => e.estado === 'activo').length;
    const empenosFinalizados = empenos.filter(e => e.estado === 'finalizado').length;
    const empenosVencidos = empenos.filter(e => e.estado === 'vencido').length;

    const resumen = [
      { 'Métrica': 'Total Empeños', 'Valor': empenos.length },
      { 'Métrica': 'Empeños Activos', 'Valor': empenosActivos },
      { 'Métrica': 'Empeños Finalizados', 'Valor': empenosFinalizados },
      { 'Métrica': 'Empeños Vencidos', 'Valor': empenosVencidos },
      { 'Métrica': 'Monto Total Prestado', 'Valor': totalPrestado },
      { 'Métrica': 'Total Intereses', 'Valor': totalInteres },
      { 'Métrica': 'Total a Recuperar', 'Valor': totalPrestado + totalInteres }
    ];

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Hoja 1: Empeños
    const wsEmpenos = XLSX.utils.json_to_sheet(datosEmpenos);
    XLSX.utils.book_append_sheet(wb, wsEmpenos, 'Empeños');

    // Hoja 2: Resumen
    const wsResumen = XLSX.utils.json_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja 3: Usuarios
    const datosUsuarios = usuarios.map(u => ({
      'ID': u.id_usuario,
      'Nombre': u.nombre_completo,
      'DNI': u.dni,
      'Email': u.email,
      'Teléfono': u.telefono,
      'Dirección': u.direccion,
      'Fecha Registro': new Date(u.fecha_registro).toLocaleDateString('es-CO')
    }));
    const wsUsuarios = XLSX.utils.json_to_sheet(datosUsuarios);
    XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');

    // Guardar archivo
    const fechaActual = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');
    XLSX.writeFile(wb, `reporte_completo_${fechaActual}.xlsx`);
  };

  // Función para exportar informe de usuarios a PDF
  const exportInformeUsuarios = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-CO');

    // Título
    doc.setFontSize(18);
    doc.setTextColor(102, 126, 234);
    doc.text('Informe de Usuarios', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${fechaActual}`, 14, 28);

    // Calcular estadísticas por usuario
    const usuariosConStats = usuarios.map(usuario => {
      const empenosUsuario = empenos.filter(e => e.id_usuario === usuario.id_usuario);
      const empenosActivos = empenosUsuario.filter(e => e.estado === 'activo');
      const deudaTotal = empenosActivos.reduce((sum, e) => 
        sum + parseFloat(e.monto_prestado || 0) + parseFloat(e.interes || 0), 0
      );

      return {
        nombre: usuario.nombre_completo,
        dni: usuario.dni,
        totalEmpenos: empenosUsuario.length,
        empenosActivos: empenosActivos.length,
        deudaTotal: deudaTotal
      };
    });

    // Preparar datos para la tabla
    const tableData = usuariosConStats.map(u => [
      u.nombre,
      u.dni,
      u.totalEmpenos,
      u.empenosActivos,
      formatCurrency(u.deudaTotal)
    ]);

    // Tabla
    doc.autoTable({
      startY: 35,
      head: [['Nombre', 'DNI', 'Total Empeños', 'Activos', 'Deuda Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 40, halign: 'right' }
      }
    });

    // Resumen general
    const finalY = doc.lastAutoTable.finalY || 35;
    const totalUsuarios = usuarios.length;
    const usuariosConDeuda = usuariosConStats.filter(u => u.deudaTotal > 0).length;
    const deudaGlobalTotal = usuariosConStats.reduce((sum, u) => sum + u.deudaTotal, 0);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Usuarios: ${totalUsuarios}`, 14, finalY + 10);
    doc.text(`Usuarios con Deuda Activa: ${usuariosConDeuda}`, 14, finalY + 17);
    doc.text(`Deuda Global Total: ${formatCurrency(deudaGlobalTotal)}`, 14, finalY + 24);

    // Guardar
    doc.save(`informe_usuarios_${fechaActual.replace(/\//g, '-')}.pdf`);
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

      {/* Gráficos y métricas mejoradas */}
      <DashboardCharts />

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
  const renderCitas = () => {
    // Filtrar citas
    const citasFiltradas = citas.filter(cita => {
      const matchBusqueda = !busqueda || 
        cita.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cita.dni?.toString().includes(busqueda) ||
        cita.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cita.marca?.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchEstado = !filtroEstadoCita || cita.estado === filtroEstadoCita;
      
      return matchBusqueda && matchEstado;
    });

    // Ordenar citas
    const citasOrdenadas = [...citasFiltradas].sort((a, b) => {
      switch (ordenCitas) {
        case 'fecha_asc':
          return new Date(a.fecha) - new Date(b.fecha);
        case 'fecha_desc':
          return new Date(b.fecha) - new Date(a.fecha);
        case 'valor_asc':
          return (a.resultado_valor || 0) - (b.resultado_valor || 0);
        case 'valor_desc':
          return (b.resultado_valor || 0) - (a.resultado_valor || 0);
        default:
          return new Date(b.fecha) - new Date(a.fecha);
      }
    });

    return (
      <div className="table-container">
        <div className="table-header">
          <h2>📅 Gestión de Citas ({citasOrdenadas.length}/{citas.length})</h2>
          <button 
            className="btn-export"
            onClick={() => exportarCSV(citasOrdenadas, 'citas')}
            disabled={citasOrdenadas.length === 0}
          >
            📥 Exportar CSV
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="filters-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por usuario, DNI, tipo o marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filtroEstadoCita}
            onChange={(e) => setFiltroEstadoCita(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select 
            className="filter-select"
            value={ordenCitas}
            onChange={(e) => setOrdenCitas(e.target.value)}
          >
            <option value="fecha_desc">Fecha: Más reciente</option>
            <option value="fecha_asc">Fecha: Más antigua</option>
            <option value="valor_desc">Valor: Mayor a menor</option>
            <option value="valor_asc">Valor: Menor a mayor</option>
          </select>

          {(busqueda || filtroEstadoCita) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setBusqueda('');
                setFiltroEstadoCita('');
              }}
            >
              ✖ Limpiar filtros
            </button>
          )}
        </div>
        
        {citasOrdenadas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No se encontraron citas</h3>
            <p>Intenta con otros filtros de búsqueda</p>
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
              {citasOrdenadas.map((cita) => (
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
                    {cita.estado === 'confirmada' && (
                      <button
                        onClick={() => crearEmpenoDescrita(cita.id_cita)}
                        className="btn btn-sm btn-primary"
                      >
                        💼 Crear Empeño
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Render Empeños
  const renderEmpenos = () => {
    // Filtrar empeños
    const empenosFiltrados = empenos.filter(empeno => {
      const matchBusqueda = !busqueda || 
        empeno.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        empeno.dni?.toString().includes(busqueda) ||
        empeno.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        empeno.marca?.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchEstado = !filtroEstadoEmpeno || empeno.estado === filtroEstadoEmpeno;
      
      return matchBusqueda && matchEstado;
    });

    return (
      <div className="table-container">
        <div className="table-header">
          <h2>💼 Gestión de Empeños ({empenosFiltrados.length}/{empenos.length})</h2>
          <div className="header-actions">
            <button 
              className="btn-export"
              onClick={() => exportarCSV(empenosFiltrados, 'empenos')}
              disabled={empenosFiltrados.length === 0}
            >
              📥 Exportar CSV
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setEmpenoToCreate({});
                setShowCrearEmpenoModal(true);
              }}
            >
              ➕ Crear Empeño
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="filters-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por usuario, DNI, tipo o marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filtroEstadoEmpeno}
            onChange={(e) => setFiltroEstadoEmpeno(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="vencido">Vencido</option>
            <option value="recuperado">Recuperado</option>
          </select>

          {(busqueda || filtroEstadoEmpeno) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setBusqueda('');
                setFiltroEstadoEmpeno('');
              }}
            >
              ✖ Limpiar filtros
            </button>
          )}
        </div>
        
        {empenosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">�</div>
            <h3>No se encontraron empeños</h3>
            <p>Intenta con otros filtros de búsqueda</p>
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
              {empenosFiltrados.map((empeno) => (
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
  };

  // Render Usuarios
  const renderUsuarios = () => (
    <div className="table-container">
      <div className="table-header">
        <h2>👥 Gestión de Usuarios ({usuarios.length})</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
          <button 
            className="btn-export btn-pdf"
            onClick={exportInformeUsuarios}
            disabled={usuarios.length === 0}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: usuarios.length === 0 ? 'not-allowed' : 'pointer',
              opacity: usuarios.length === 0 ? 0.5 : 1,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (usuarios.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            📥 Exportar Informe
          </button>
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

  // Render Objetos
  const renderObjetos = () => {
    console.log('=== RENDER OBJETOS LLAMADO ===');
    console.log('Cantidad de objetos:', objetos.length);
    
    // Filtrar objetos
    const objetosFiltrados = objetos.filter(objeto => {
      const matchBusqueda = !busqueda || 
        objeto.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        objeto.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
        objeto.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        objeto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchTipo = !filtroTipo || objeto.tipo === filtroTipo;
      const matchEstado = !filtroEstado || objeto.estado === filtroEstado;
      
      return matchBusqueda && matchTipo && matchEstado;
    });

    // Obtener tipos únicos para el filtro
    const tiposUnicos = [...new Set(objetos.map(o => o.tipo))].filter(Boolean);
    const estadosUnicos = [...new Set(objetos.map(o => o.estado))].filter(Boolean);
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h2>📦 Gestión de Objetos ({objetosFiltrados.length}/{objetos.length})</h2>
          <button 
            className="btn-export"
            onClick={() => exportarCSV(objetosFiltrados, 'objetos')}
            disabled={objetosFiltrados.length === 0}
          >
            📥 Exportar CSV
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="filters-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Buscar por tipo, marca, modelo o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosUnicos.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {(busqueda || filtroTipo || filtroEstado) && (
            <button 
              className="btn-clear-filters"
              onClick={() => {
                setBusqueda('');
                setFiltroTipo('');
                setFiltroEstado('');
              }}
            >
              ✖ Limpiar filtros
            </button>
          )}
        </div>
        
        {objetosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No se encontraron objetos</h3>
            <p>Intenta con otros filtros de búsqueda</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Antigüedad</th>
                <th>Valor Estimado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {objetosFiltrados.map((objeto) => (
                <tr key={objeto.id_objeto}>
                  <td>#{objeto.id_objeto}</td>
                  <td>{objeto.tipo}</td>
                  <td>{objeto.marca || 'N/A'}</td>
                  <td>{objeto.modelo || 'N/A'}</td>
                  <td className="description-cell">{objeto.descripcion}</td>
                  <td>
                    <span className={`badge badge-${
                      objeto.estado === 'Excelente' ? 'success' :
                      objeto.estado === 'Bueno' ? 'info' :
                      objeto.estado === 'Regular' ? 'warning' : 'secondary'
                    }`}>
                      {objeto.estado}
                    </span>
                  </td>
                  <td>{objeto.antiguedad} {objeto.antiguedad === 1 ? 'año' : 'años'}</td>
                  <td>{formatCurrency(objeto.valor_estimado)}</td>
                  <td>{new Date(objeto.fecha_registro).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-action btn-view"
                      onClick={() => {
                        setSelectedObjetoId(objeto.id_objeto);
                        setShowDetalleObjetoModal(true);
                      }}
                      title="Ver detalle completo"
                    >
                      👁️ Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };  // Render Reportes
  const renderReportes = () => (
    <div className="reportes-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>📊 Reportes Mensuales</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-export btn-pdf"
            onClick={exportReportePDF}
            disabled={reporteMensual.length === 0}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: reporteMensual.length === 0 ? 'not-allowed' : 'pointer',
              opacity: reporteMensual.length === 0 ? 0.5 : 1,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (reporteMensual.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            📄 Exportar PDF
          </button>
          <button 
            className="btn-export btn-excel"
            onClick={exportReporteExcel}
            disabled={empenos.length === 0}
            style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: empenos.length === 0 ? 'not-allowed' : 'pointer',
              opacity: empenos.length === 0 ? 0.5 : 1,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (empenos.length > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>
      
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
          <NotificationBell />
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
              {activeTab === 'objetos' && renderObjetos()}
              {activeTab === 'reportes' && renderReportes()}
              {activeTab === 'configuracion' && renderConfiguracion()}
            </>
          )}
        </main>
      </div>

      {/* Modal para Crear Empeño */}
      {showCrearEmpenoModal && (
        <CrearEmpenoModal
          citaId={selectedCitaId}
          empenoData={empenoToCreate}
          onClose={() => {
            setShowCrearEmpenoModal(false);
            setSelectedCitaId(null);
            setEmpenoToCreate(null);
          }}
          onCreated={handleEmpenoCreado}
        />
      )}

      {/* Modal para Detalle de Objeto */}
      {showDetalleObjetoModal && selectedObjetoId && (
        <DetalleObjetoModal
          objetoId={selectedObjetoId}
          onClose={() => {
            setShowDetalleObjetoModal(false);
            setSelectedObjetoId(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;
