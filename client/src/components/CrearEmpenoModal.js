import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CrearEmpenoModal.css';

const CrearEmpenoModal = ({ citaId, empenoData, onClose, onCreated }) => {
  const [loading, setLoading] = useState(citaId ? true : false);
  const [citaDetalle, setCitaDetalle] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: '',
    id_objeto: '',
    monto_prestado: '',
    interes: '',
    plazo_dias: 30,
    notas: ''
  });

  useEffect(() => {
    if (citaId) {
      loadCitaDetalle();
    } else {
      loadUsuariosYObjetos();
    }
  }, [citaId]);

  const loadUsuariosYObjetos = async () => {
    try {
      const [usuariosRes, objetosRes] = await Promise.all([
        api.get('/admin/usuarios'),
        api.get('/admin/objetos')
      ]);
      setUsuarios(usuariosRes.data);
      // Solo objetos sin empeño activo
      setObjetos(objetosRes.data.filter(obj => !obj.estado_empeno || obj.estado_empeno !== 'activo'));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar usuarios y objetos');
    }
  };

  const loadCitaDetalle = async () => {
    try {
      const response = await api.get(`/workflow/cita-detalle/${citaId}`);
      setCitaDetalle(response.data.cita);
      
      // Pre-llenar con sugerencias
      const sugerencias = response.data.sugerencias;
      setFormData({
        monto_prestado: sugerencias.monto_prestado,
        interes: sugerencias.interes,
        plazo_dias: sugerencias.plazo_dias,
        notas: ''
      });
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar los datos de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (citaId) {
        // Crear desde cita
        response = await api.post('/workflow/crear-desde-cita', {
          id_cita: citaId,
          monto_prestado: formData.monto_prestado,
          interes: formData.interes,
          plazo_dias: formData.plazo_dias,
          notas: formData.notas
        });
      } else {
        // Crear manualmente
        if (!formData.id_usuario || !formData.id_objeto) {
          alert('Por favor selecciona un usuario y un objeto');
          setLoading(false);
          return;
        }
        response = await api.post('/empenos', formData);
      }

      alert('✅ ' + (response.data.message || 'Empeño creado exitosamente'));
      onCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error al crear empeño:', error);
      alert('❌ Error al crear empeño: ' + (error.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return parseFloat(formData.monto_prestado || 0) + parseFloat(formData.interes || 0);
  };

  const calcularInteresSugerido = () => {
    const monto = parseFloat(formData.monto_prestado || 0);
    const tasa = 0.05; // 5% mensual
    return Math.round(monto * tasa);
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Si es modo cita pero no hay citaDetalle, seguir cargando
  if (citaId && !citaDetalle) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="spinner"></div>
          <p>Cargando datos de la cita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{citaId ? '🎯 Crear Empeño desde Cita' : '➕ Crear Empeño Nuevo'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {citaDetalle ? (
            /* Modo desde cita - mostrar datos precargados */
            <>
              {/* Información del Cliente */}
              <div className="info-section">
                <h3>👤 Datos del Cliente</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre:</label>
                    <span className="info-value">{citaDetalle.usuario_nombre}</span>
                  </div>
                  <div className="info-item">
                    <label>DNI:</label>
                    <span className="info-value">{citaDetalle.dni}</span>
                  </div>
                  <div className="info-item">
                    <label>Contacto:</label>
                    <span className="info-value">{citaDetalle.contacto}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span className="info-value">{citaDetalle.email}</span>
                  </div>
                </div>
              </div>

              {/* Información del Objeto */}
              <div className="info-section">
                <h3>📦 Datos del Objeto</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Tipo:</label>
                    <span className="info-value">{citaDetalle.tipo}</span>
                  </div>
                  <div className="info-item">
                    <label>Marca:</label>
                    <span className="info-value">{citaDetalle.marca || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Modelo:</label>
                    <span className="info-value">{citaDetalle.modelo || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span className="info-value">{citaDetalle.estado}</span>
                  </div>
                </div>
                <div className="info-item full-width">
                  <label>Descripción:</label>
                  <p className="info-description">{citaDetalle.descripcion}</p>
                </div>
                
                {citaDetalle.fotos && citaDetalle.fotos !== 'null' && citaDetalle.fotos !== '' && (
                  <div className="fotos-preview">
                    <label>Fotos:</label>
                    <div className="fotos-grid">
                      {(() => {
                        try {
                          const fotosArray = typeof citaDetalle.fotos === 'string' 
                            ? JSON.parse(citaDetalle.fotos) 
                            : citaDetalle.fotos;
                          return Array.isArray(fotosArray) && fotosArray.slice(0, 3).map((foto, index) => (
                            <img key={index} src={foto} alt={`Foto ${index + 1}`} />
                          ));
                        } catch (e) {
                          return <p className="text-muted">No hay fotos disponibles</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Valoración IA */}
              <div className="info-section highlight">
                <h3>🤖 Valoración de IA</h3>
                <div className="ia-result">
                  <div className="ia-value">
                    <span className="label">Valor Estimado:</span>
                    <span className="value">${citaDetalle.resultado_valor?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="ia-confidence">
                    <span className="label">Confiabilidad:</span>
                    <span className="value">{citaDetalle && citaDetalle.confiabilidad ? ((citaDetalle.confiabilidad * 100).toFixed(0) + '%') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Modo creación manual */
            <div className="form-section">
              <h3>👤 Seleccionar Usuario y Objeto</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Usuario *</label>
                  <select 
                    value={formData.id_usuario}
                    onChange={(e) => setFormData({...formData, id_usuario: e.target.value})}
                    required
                  >
                    <option value="">-- Seleccionar usuario --</option>
                    {usuarios.map(user => (
                      <option key={user.id_usuario} value={user.id_usuario}>
                        {user.nombre} - DNI: {user.dni}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Objeto *</label>
                  <select 
                    value={formData.id_objeto}
                    onChange={(e) => setFormData({...formData, id_objeto: e.target.value})}
                    required
                  >
                    <option value="">-- Seleccionar objeto --</option>
                    {objetos.map(obj => (
                      <option key={obj.id_objeto} value={obj.id_objeto}>
                        #{obj.id_objeto} - {obj.tipo} {obj.marca} ({obj.estado})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Empeño */}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>💰 Condiciones del Empeño</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Monto a Prestar ($) *</label>
                  <input
                    type="number"
                    value={formData.monto_prestado}
                    onChange={(e) => setFormData({...formData, monto_prestado: e.target.value})}
                    required
                    min="1"
                    step="1"
                    className="form-input"
                  />
                  {citaDetalle && citaDetalle.resultado_valor && (
                    <small className="form-hint">
                      Sugerido: ${(citaDetalle.resultado_valor * 0.7).toLocaleString()} (70% del valor)
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Interés Mensual ($) *</label>
                  <div className="input-with-button">
                    <input
                      type="number"
                      value={formData.interes}
                      onChange={(e) => setFormData({...formData, interes: e.target.value})}
                      required
                      min="0"
                      step="1"
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, interes: calcularInteresSugerido()})}
                      className="btn btn-sm btn-secondary"
                    >
                      Calcular (5%)
                    </button>
                  </div>
                  <small className="form-hint">
                    Tasa sugerida: 5% mensual
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Plazo (días)</label>
                  <select
                    value={formData.plazo_dias}
                    onChange={(e) => setFormData({...formData, plazo_dias: e.target.value})}
                    className="form-input"
                  >
                    <option value="15">15 días</option>
                    <option value="30">30 días (recomendado)</option>
                    <option value="45">45 días</option>
                    <option value="60">60 días</option>
                    <option value="90">90 días</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Total a Recuperar</label>
                  <div className="total-display">
                    ${calcularTotal().toLocaleString()}
                  </div>
                  <small className="form-hint">
                    Monto prestado + Interés
                  </small>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notas Internas (opcional)</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  rows="3"
                  className="form-input"
                  placeholder="Observaciones sobre el objeto, condición especial, etc..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Creando...' : '✅ Crear Empeño'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearEmpenoModal;
