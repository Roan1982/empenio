import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SolicitarCotizacion = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    tipo: '',
    marca: '',
    modelo: '',
    descripcion: '',
    estado: '',
    antiguedad: '',
  });
  const [fotos, setFotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files);
    setFotos([...fotos, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const removePreview = (index) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir objeto con fotos
      const formDataUpload = new FormData();
      formDataUpload.append('tipo', formData.tipo);
      formDataUpload.append('marca', formData.marca);
      formDataUpload.append('modelo', formData.modelo);
      formDataUpload.append('descripcion', formData.descripcion);
      formDataUpload.append('estado', formData.estado);
      formDataUpload.append('antiguedad', formData.antiguedad);

      fotos.forEach(foto => {
        formDataUpload.append('fotos', foto);
      });

      if (video) {
        formDataUpload.append('video', video);
      }

      const uploadResponse = await api.post('/objetos/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const idObjeto = uploadResponse.data.id_objeto;

      // 2. Solicitar pre-cotización con IA
      const cotizacionResponse = await api.post('/precotizacion/solicitar', {
        id_objeto: idObjeto,
      });

      setResultado(cotizacionResponse.data);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Error al procesar la solicitud'));
    } finally {
      setLoading(false);
    }
  };

  const solicitarCita = async () => {
    navigate('/mis-citas', { state: { nuevaCita: true, resultado } });
  };

  if (resultado) {
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
            <div className="cotizacion-form">
              <div className="card fade-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                  ¡Pre-cotización Completada!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                  Nuestra IA ha analizado tu objeto y generó una estimación
                </p>

                <div className="stats-grid" style={{ marginBottom: '32px' }}>
                  <div className="stat-card">
                    <div className="stat-icon success">💰</div>
                    <div className="stat-value">${resultado.valor_estimado?.toLocaleString()}</div>
                    <div className="stat-label">Valor Estimado</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon primary">💵</div>
                    <div className="stat-value">${resultado.monto_prestamo?.toLocaleString()}</div>
                    <div className="stat-label">Monto Préstamo (70%)</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon warning">📈</div>
                    <div className="stat-value">${resultado.interes_mensual?.toLocaleString()}</div>
                    <div className="stat-label">Interés Mensual (15%)</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon info">🎯</div>
                    <div className="stat-value">{Math.round(resultado.confiabilidad * 100)}%</div>
                    <div className="stat-label">Confiabilidad</div>
                  </div>
                </div>

                <div style={{ 
                  background: 'var(--light)', 
                  padding: '24px', 
                  borderRadius: '12px',
                  marginBottom: '32px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    📋 Detalles del Préstamo
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ padding: '8px 0', borderBottom: '1px solid var(--light-darker)' }}>
                      <strong>Plazo:</strong> 30 días
                    </li>
                    <li style={{ padding: '8px 0', borderBottom: '1px solid var(--light-darker)' }}>
                      <strong>Monto total a pagar:</strong> ${(resultado.monto_prestamo + resultado.interes_mensual)?.toLocaleString()}
                    </li>
                    <li style={{ padding: '8px 0', borderBottom: '1px solid var(--light-darker)' }}>
                      <strong>Renovación:</strong> Paga solo ${resultado.interes_mensual?.toLocaleString()} y extiende 30 días
                    </li>
                    <li style={{ padding: '8px 0' }}>
                      <strong>Sin verificación:</strong> Solo con tu DNI
                    </li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={solicitarCita} className="btn btn-primary">
                    📅 Coordinar Cita
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
                    🏠 Volver al Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="cotizacion-form">
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline mb-3">
              ← Volver
            </button>

            <div className="card fade-in">
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                🔍 Solicitar Pre-Cotización con IA
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Completa los datos de tu objeto para obtener una estimación automática
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-2">
                  <div className="input-group">
                    <label>Tipo de Objeto *</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Celular">📱 Celular</option>
                      <option value="Notebook">💻 Notebook</option>
                      <option value="Tablet">📲 Tablet</option>
                      <option value="Reloj">⌚ Reloj</option>
                      <option value="Televisor">📺 Televisor</option>
                      <option value="Consola">🎮 Consola</option>
                      <option value="Joya">💍 Joya</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Marca *</label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      required
                      placeholder="Samsung, Apple, etc."
                    />
                  </div>

                  <div className="input-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleChange}
                      placeholder="Galaxy S21, iPhone 13, etc."
                    />
                  </div>

                  <div className="input-group">
                    <label>Estado *</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Nuevo">✨ Nuevo</option>
                      <option value="Usado">👍 Usado (Buen estado)</option>
                      <option value="Deteriorado">⚠️ Deteriorado</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Antigüedad (años) *</label>
                    <input
                      type="number"
                      name="antiguedad"
                      value={formData.antiguedad}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="2"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Descripción Técnica *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    placeholder="Describe las características técnicas, accesorios incluidos, estado general, etc."
                  />
                </div>

                <div className="input-group">
                  <label>Fotos del Objeto (máx. 5)</label>
                  <div className="upload-area" onClick={() => document.getElementById('fotos').click()}>
                    <div className="upload-icon">📷</div>
                    <p>Haz clic para subir fotos</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      JPG, PNG o GIF - Máximo 10MB por archivo
                    </p>
                  </div>
                  <input
                    id="fotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotosChange}
                    style={{ display: 'none' }}
                  />

                  {previews.length > 0 && (
                    <div className="preview-images">
                      {previews.map((preview, index) => (
                        <div key={index} className="preview-image">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="preview-remove"
                            onClick={() => removePreview(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Video del Objeto Funcionando (opcional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                  {video && (
                    <p style={{ fontSize: '12px', color: 'var(--secondary)', marginTop: '8px' }}>
                      ✅ Video seleccionado: {video.name}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? '🤖 Analizando con IA...' : '🚀 Obtener Pre-Cotización'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarCotizacion;
