import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/DetalleObjetoModal.css';

const DetalleObjetoModal = ({ objetoId, onClose }) => {
  const [objeto, setObjeto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (objetoId) {
      loadObjetoDetalle();
    }
  }, [objetoId]);

  const loadObjetoDetalle = async () => {
    try {
      const response = await api.get(`/admin/objetos/${objetoId}`);
      setObjeto(response.data);
      
      // Seleccionar primera media por defecto
      if (response.data.fotos && response.data.fotos.length > 0) {
        setSelectedMedia(response.data.fotos[0]);
      }
    } catch (error) {
      console.error('Error al cargar detalle del objeto:', error);
      alert('Error al cargar los detalles del objeto');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isImage = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const openLightbox = (media) => {
    setSelectedMedia(media);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'disponible': { class: 'badge-success', text: 'Disponible' },
      'empenado': { class: 'badge-warning', text: 'Empeñado' },
      'vendido': { class: 'badge-danger', text: 'Vendido' },
      'retirado': { class: 'badge-info', text: 'Retirado' }
    };
    return badges[estado] || { class: 'badge-secondary', text: estado };
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="detalle-modal" onClick={(e) => e.stopPropagation()}>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!objeto) {
    return null;
  }

  const estadoBadge = getEstadoBadge(objeto.estado);
  const mediaList = objeto.fotos || [];

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="detalle-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              📦 Detalle del Objeto
              <span className={`badge ${estadoBadge.class}`} style={{ marginLeft: '1rem' }}>
                {estadoBadge.text}
              </span>
            </h2>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="detalle-grid">
              {/* Columna izquierda: Galería */}
              <div className="galeria-section">
                {mediaList.length > 0 ? (
                  <>
                    <div className="media-principal">
                      {isVideo(selectedMedia) ? (
                        <video 
                          key={selectedMedia}
                          controls 
                          className="video-principal"
                          onClick={() => openLightbox(selectedMedia)}
                        >
                          <source src={selectedMedia} type="video/mp4" />
                          Tu navegador no soporta el elemento de video.
                        </video>
                      ) : isImage(selectedMedia) ? (
                        <img 
                          src={selectedMedia} 
                          alt={objeto.tipo}
                          className="imagen-principal"
                          onClick={() => openLightbox(selectedMedia)}
                        />
                      ) : (
                        <div className="no-media">
                          <span>📄</span>
                          <p>Archivo no visualizable</p>
                        </div>
                      )}
                    </div>

                    {mediaList.length > 1 && (
                      <div className="thumbnails">
                        {mediaList.map((media, index) => (
                          <div 
                            key={index}
                            className={`thumbnail ${selectedMedia === media ? 'active' : ''}`}
                            onClick={() => setSelectedMedia(media)}
                          >
                            {isVideo(media) ? (
                              <div className="thumbnail-video">
                                <span>▶️</span>
                                <video src={media} />
                              </div>
                            ) : isImage(media) ? (
                              <img src={media} alt={`${objeto.tipo} ${index + 1}`} />
                            ) : (
                              <div className="thumbnail-file">📄</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-media-placeholder">
                    <span>📷</span>
                    <p>No hay imágenes o videos disponibles</p>
                  </div>
                )}
              </div>

              {/* Columna derecha: Información */}
              <div className="info-section">
                <div className="info-group">
                  <h3>🏷️ Información General</h3>
                  <div className="info-row">
                    <label>ID:</label>
                    <span>#{objeto.id_objeto}</span>
                  </div>
                  <div className="info-row">
                    <label>Tipo:</label>
                    <span>{objeto.tipo}</span>
                  </div>
                  <div className="info-row">
                    <label>Marca:</label>
                    <span>{objeto.marca || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Modelo:</label>
                    <span>{objeto.modelo || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <label>Estado del Producto:</label>
                    <span>{objeto.condicion || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-group">
                  <h3>💰 Valoración</h3>
                  <div className="info-row">
                    <label>Valor Estimado:</label>
                    <span className="valor-estimado">
                      ${objeto.valor_estimado ? objeto.valor_estimado.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {objeto.resultado_ia && (
                    <div className="info-row">
                      <label>Valoración IA:</label>
                      <span>${objeto.resultado_ia.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="info-group">
                  <h3>👤 Propietario</h3>
                  <div className="info-row">
                    <label>Nombre:</label>
                    <span>{objeto.propietario || 'N/A'}</span>
                  </div>
                  {objeto.dni_propietario && (
                    <div className="info-row">
                      <label>DNI:</label>
                      <span>{objeto.dni_propietario}</span>
                    </div>
                  )}
                </div>

                {objeto.descripcion && (
                  <div className="info-group">
                    <h3>📝 Descripción</h3>
                    <p className="descripcion-text">{objeto.descripcion}</p>
                  </div>
                )}

                <div className="info-group">
                  <h3>📅 Fechas</h3>
                  <div className="info-row">
                    <label>Registrado:</label>
                    <span>{new Date(objeto.fecha_registro).toLocaleDateString()}</span>
                  </div>
                  {objeto.fecha_ultima_actualizacion && (
                    <div className="info-row">
                      <label>Última Actualización:</label>
                      <span>{new Date(objeto.fecha_ultima_actualizacion).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {objeto.estado === 'empenado' && objeto.empeno_info && (
                  <div className="info-group empeno-info">
                    <h3>💎 Información del Empeño</h3>
                    <div className="info-row">
                      <label>Monto Prestado:</label>
                      <span>${objeto.empeno_info.monto_prestado?.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <label>Interés:</label>
                      <span>${objeto.empeno_info.interes?.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <label>Fecha Vencimiento:</label>
                      <span>{new Date(objeto.empeno_info.fecha_vencimiento).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox para vista ampliada */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {isVideo(selectedMedia) ? (
              <video controls className="lightbox-media" autoPlay>
                <source src={selectedMedia} type="video/mp4" />
              </video>
            ) : (
              <img src={selectedMedia} alt="Vista ampliada" className="lightbox-media" />
            )}
          </div>
          <div className="lightbox-nav">
            <button 
              className="nav-btn"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = mediaList.indexOf(selectedMedia);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : mediaList.length - 1;
                setSelectedMedia(mediaList[prevIndex]);
              }}
            >
              ‹ Anterior
            </button>
            <span className="lightbox-counter">
              {mediaList.indexOf(selectedMedia) + 1} / {mediaList.length}
            </span>
            <button 
              className="nav-btn"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = mediaList.indexOf(selectedMedia);
                const nextIndex = currentIndex < mediaList.length - 1 ? currentIndex + 1 : 0;
                setSelectedMedia(mediaList[nextIndex]);
              }}
            >
              Siguiente ›
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DetalleObjetoModal;
