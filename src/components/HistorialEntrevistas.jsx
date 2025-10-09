import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  Eye,
  Trash2,
  Filter,
  TrendingUp,
  Award
} from 'lucide-react';
import Background from './Background';
import entrevistaService from '../services/entrevistaService';
import '../styles/HistorialEntrevistas.css';

const HistorialEntrevistas = () => {
  const [entrevistas, setEntrevistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('all');
  const [estadisticas, setEstadisticas] = useState(null);
  const [entrevistaSeleccionada, setEntrevistaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);

  useEffect(() => {
    cargarEntrevistas();
    cargarEstadisticas();
  }, []);

  // ========== CARGAR ENTREVISTAS ==========
  const cargarEntrevistas = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Cargando entrevistas...');
      
      const result = await entrevistaService.obtenerEntrevistas();
      
      if (result.success) {
        setEntrevistas(result.data.entrevistas || []);
        console.log('✅ Entrevistas cargadas:', result.data.entrevistas?.length || 0);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('❌ Error cargando entrevistas:', err);
      setError('Error al cargar las entrevistas');
    } finally {
      setLoading(false);
    }
  };

  // ========== CARGAR ESTADÍSTICAS ==========
  const cargarEstadisticas = async () => {
    try {
      console.log('📊 Cargando estadísticas...');
      
      const result = await entrevistaService.obtenerEstadisticas();
      
      if (result.success) {
        setEstadisticas(result.data);
        console.log('✅ Estadísticas cargadas');
      }
    } catch (err) {
      console.error('❌ Error cargando estadísticas:', err);
    }
  };

  // ========== VER DETALLES DE ENTREVISTA ==========
  const verDetalles = async (entrevista) => {
    try {
      setLoading(true);
      
      console.log('👁️ Obteniendo detalles de entrevista:', entrevista.id);
      
      const result = await entrevistaService.obtenerHistorialEntrevista(entrevista.id);
      
      if (result.success) {
        setEntrevistaSeleccionada({
          ...entrevista,
          historial: result.data.historial
        });
        setShowDetalles(true);
        console.log('✅ Detalles obtenidos');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('❌ Error obteniendo detalles:', err);
      setError('Error al obtener detalles');
    } finally {
      setLoading(false);
    }
  };

  // ========== ELIMINAR ENTREVISTA ==========
  const eliminarEntrevista = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta entrevista?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando entrevista:', id);
      
      // Aquí iría el endpoint de eliminación si existe
      // Por ahora solo eliminamos del estado local
      setEntrevistas(entrevistas.filter(e => e.id !== id));
      
      console.log('✅ Entrevista eliminada');
    } catch (err) {
      console.error('❌ Error eliminando entrevista:', err);
      setError('Error al eliminar entrevista');
    }
  };

  // ========== FILTRAR ENTREVISTAS ==========
  const entrevistasFiltradas = entrevistas.filter(entrevista => {
    const matchSearch = searchTerm === '' || 
      entrevista.fecha_creacion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filterEstado === 'all' || 
      entrevista.estado === filterEstado;
    
    return matchSearch && matchEstado;
  });

  // ========== FORMATEAR FECHA ==========
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha desconocida';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ========== OBTENER ICONO DE ESTADO ==========
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'completada':
        return <CheckCircle size={18} className="icon-success" />;
      case 'abandonada':
        return <XCircle size={18} className="icon-error" />;
      case 'en_curso':
        return <Clock size={18} className="icon-warning" />;
      default:
        return <AlertCircle size={18} className="icon-info" />;
    }
  };

  // ========== LOADING STATE ==========
  if (loading && entrevistas.length === 0) {
    return (
      <div className="historial-container">
        <div className="loader-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loader-spinner"
          />
          <p className="loader-text">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Background />
      <div className="historial-entrevistas-container">
        {/* Header */}
        <motion.div
          className="historial-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content-wrapper">
          <div className="header-icon-wrapper">
            <MessageCircle size={24} />
          </div>
          <div className="header-text">
            <h2 className="historial-title">Historial de Entrevistas</h2>
            <p className="historial-subtitle">
              {entrevistasFiltradas.length} entrevista{entrevistasFiltradas.length !== 1 ? 's' : ''} encontrada{entrevistasFiltradas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas Resumen */}
      {estadisticas && (
        <motion.div 
          className="estadisticas-resumen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card">
            <div className="stat-icon primary">
              <MessageCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{estadisticas.total || 0}</span>
              <span className="stat-label">Total Entrevistas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{estadisticas.completadas || 0}</span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{estadisticas.promedio_duracion || 'N/A'}</span>
              <span className="stat-label">Duración Promedio</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon accent">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{estadisticas.puntuacion_promedio || 'N/A'}</span>
              <span className="stat-label">Puntuación Media</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div 
        className="historial-filters"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Búsqueda */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filtro de Estado */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterEstado === 'all' ? 'active' : ''}`}
            onClick={() => setFilterEstado('all')}
          >
            <Filter size={16} />
            Todas
          </button>
          <button
            className={`filter-btn ${filterEstado === 'completada' ? 'active' : ''}`}
            onClick={() => setFilterEstado('completada')}
          >
            <CheckCircle size={16} />
            Completadas
          </button>
          <button
            className={`filter-btn ${filterEstado === 'en_curso' ? 'active' : ''}`}
            onClick={() => setFilterEstado('en_curso')}
          >
            <Clock size={16} />
            En Curso
          </button>
          <button
            className={`filter-btn ${filterEstado === 'abandonada' ? 'active' : ''}`}
            onClick={() => setFilterEstado('abandonada')}
          >
            <XCircle size={16} />
            Abandonadas
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Entrevistas */}
      {entrevistasFiltradas.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">
            <MessageCircle size={48} />
          </div>
          <h3 className="empty-title">No hay entrevistas</h3>
          <p className="empty-text">
            {searchTerm || filterEstado !== 'all' 
              ? 'No se encontraron entrevistas con los filtros aplicados' 
              : 'Aún no has realizado ninguna entrevista'}
          </p>
          {(searchTerm || filterEstado !== 'all') && (
            <button 
              className="btn-primary"
              onClick={() => {
                setSearchTerm('');
                setFilterEstado('all');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </motion.div>
      ) : (
        <div className="entrevistas-grid">
          <AnimatePresence>
            {entrevistasFiltradas.map((entrevista, index) => (
              <motion.div
                key={entrevista.id}
                className="entrevista-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Header de la Card */}
                <div className="card-header">
                  <div className={`card-icon ${entrevista.estado}`}>
                    <MessageCircle size={20} />
                  </div>
                  <div className="card-info">
                    <h3 className="card-title">
                      Entrevista #{entrevista.id}
                    </h3>
                    <div className="card-date">
                      <Calendar size={14} />
                      <span>{formatearFecha(entrevista.fecha_creacion)}</span>
                    </div>
                  </div>
                </div>

                {/* Estado Badge */}
                <div className={`status-badge ${entrevista.estado}`}>
                  {obtenerIconoEstado(entrevista.estado)}
                  <span>{entrevista.estado?.replace('_', ' ') || 'Desconocido'}</span>
                </div>

                {/* Estadísticas */}
                {entrevista.estadisticas && (
                  <div className="card-stats">
                    <div className="stat-item-small">
                      <Clock size={14} />
                      <span>{entrevista.estadisticas.duracion || 'N/A'}</span>
                    </div>
                    <div className="stat-item-small">
                      <MessageCircle size={14} />
                      <span>{entrevista.estadisticas.total_mensajes || 0} mensajes</span>
                    </div>
                    {entrevista.estadisticas.puntuacion && (
                      <div className="stat-item-small">
                        <Award size={14} />
                        <span>{entrevista.estadisticas.puntuacion}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="card-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => verDetalles(entrevista)}
                    title="Ver detalles"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => eliminarEntrevista(entrevista.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Detalles */}
      <AnimatePresence>
        {showDetalles && entrevistaSeleccionada && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetalles(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <MessageCircle size={24} />
                  Detalles de la Entrevista
                </h3>
                <button 
                  className="close-button"
                  onClick={() => setShowDetalles(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Información General */}
                <div className="info-section">
                  <h4>Información General</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">ID:</span>
                      <span className="info-value">#{entrevistaSeleccionada.id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Fecha:</span>
                      <span className="info-value">{formatearFecha(entrevistaSeleccionada.fecha_creacion)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estado:</span>
                      <span className={`info-value status-${entrevistaSeleccionada.estado}`}>
                        {entrevistaSeleccionada.estado?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Historial de Mensajes */}
                {entrevistaSeleccionada.historial && entrevistaSeleccionada.historial.length > 0 && (
                  <div className="historial-section">
                    <h4>Historial de Conversación</h4>
                    <div className="mensajes-list">
                      {entrevistaSeleccionada.historial.map((mensaje, idx) => (
                        <div key={idx} className={`mensaje-preview ${mensaje.tipo}`}>
                          <strong>{mensaje.tipo === 'ia' ? 'IA:' : 'Usuario:'}</strong>
                          <p>{mensaje.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowDetalles(false)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default HistorialEntrevistas;