import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const res = await api.get('/workflow/notificaciones');
      setNotificaciones(res.data);
      setUnreadCount(res.data.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.put(`/workflow/notificaciones/${id}/leer`);
      cargarNotificaciones();
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      cita_pendiente: '📅',
      cita_confirmada: '✅',
      empeno_creado: '💼',
      pago_vencido: '⚠️',
      pago_proximo: '⏰',
      empeno_vencido: '🚨',
      pago_realizado: '💰'
    };
    return icons[tipo] || '🔔';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      cita_pendiente: '#3498db',
      cita_confirmada: '#2ecc71',
      empeno_creado: '#9b59b6',
      pago_vencido: '#e74c3c',
      pago_proximo: '#f39c12',
      empeno_vencido: '#c0392b',
      pago_realizado: '#27ae60'
    };
    return colors[tipo] || '#95a5a6';
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - date) / 1000); // segundos

    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="notification-overlay" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} sin leer</span>
              )}
            </div>

            <div className="notification-list">
              {notificaciones.length === 0 ? (
                <div className="notification-empty">
                  <span>📭</span>
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id_notificacion}
                    className={`notification-item ${!notif.leida ? 'unread' : ''}`}
                    onClick={() => marcarComoLeida(notif.id_notificacion)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: getTipoColor(notif.tipo) }}
                    >
                      {getTipoIcon(notif.tipo)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notif.mensaje}</p>
                      <span className="notification-time">
                        {formatFecha(notif.fecha_creacion)}
                      </span>
                    </div>
                    {!notif.leida && <div className="notification-dot" />}
                  </div>
                ))
              )}
            </div>

            {notificaciones.length > 0 && (
              <div className="notification-footer">
                <button
                  onClick={() => {
                    notificaciones.forEach(n => {
                      if (!n.leida) marcarComoLeida(n.id_notificacion);
                    });
                  }}
                  className="btn-mark-all"
                >
                  ✓ Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
