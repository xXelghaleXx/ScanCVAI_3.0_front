import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Trash2, 
  Eye, 
  Clock, 
  AlertCircle,
  Search,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import '../styles/HistorialCV.css';

const API_BASE_URL = 'http://localhost:3000/api';

const HistorialCV = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🔍 Obteniendo CVs...');

      const response = await fetch(`${API_BASE_URL}/cv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CVs recibidos:', data);
      
      let cvsArray = [];
      
      if (Array.isArray(data)) {
        cvsArray = data;
      } else if (data.cvs && Array.isArray(data.cvs)) {
        cvsArray = data.cvs;
      } else if (data.data && Array.isArray(data.data)) {
        cvsArray = data.data;
      }
      
      setCvs(cvsArray);
    } catch (err) {
      console.error('❌ Error obteniendo CVs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este CV?')) {
      return;
    }

    try {
      setDeletingId(cvId);
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/cv/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar el CV');
      }

      // Eliminar del estado local
      setCvs(cvs.filter(cv => cv.id !== cvId));
      
      // Mostrar mensaje de éxito
      alert('CV eliminado correctamente');
    } catch (err) {
      console.error('Error eliminando CV:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewCV = (cv) => {
    if (cv.archivo) {
      // Construir URL completa del archivo
      const fileUrl = `${API_BASE_URL.replace('/api', '')}/${cv.archivo}`;
      window.open(fileUrl, '_blank');
    } else {
      alert('No hay archivo disponible para visualizar');
    }
  };

  // 📝 FUNCIÓN PARA ABREVIAR NOMBRE DE ARCHIVO
  const abbreviateFilename = (filename, maxLength = 30) => {
    if (!filename) return 'CV sin nombre';
    
    // Extraer solo el nombre del archivo si viene con ruta
    const nameOnly = filename.split('/').pop().split('\\').pop();
    
    // Si el nombre es corto, devolverlo completo
    if (nameOnly.length <= maxLength) return nameOnly;
    
    // Separar nombre y extensión
    const lastDotIndex = nameOnly.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? nameOnly.slice(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex !== -1 ? nameOnly.slice(0, lastDotIndex) : nameOnly;
    
    // Calcular cuántos caracteres mostrar (dejando espacio para "..." y extensión)
    const availableLength = maxLength - 3 - extension.length;
    
    if (availableLength <= 0) {
      // Si el nombre es muy largo, mostrar solo inicio y extensión
      return `${nameWithoutExt.slice(0, 15)}...${extension}`;
    }
    
    // Mostrar inicio del nombre + "..." + extensión
    return `${nameWithoutExt.slice(0, availableLength)}...${extension}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const filteredCVs = cvs.filter(cv => {
    const searchLower = searchTerm.toLowerCase().trim();
    const fileName = (cv.archivo || cv.nombre_archivo || cv.filename || '').toLowerCase();
    const matchesSearch = searchLower === '' || fileName.includes(searchLower);
    
    let matchesStatus = true;
    if (filterStatus === 'procesado') {
      matchesStatus = !!cv.contenido_extraido;
    } else if (filterStatus === 'pendiente') {
      matchesStatus = !cv.contenido_extraido;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Loading State
  if (loading) {
    return (
      <div className="loader-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loader-spinner"
        />
        <p className="loader-text">Cargando historial de CVs...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon-wrapper">
          <AlertCircle size={32} />
        </div>
        <h3 className="error-title">Error al cargar los datos</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchCVs} className="btn-analyze">
          Reintentar
        </button>
      </div>
    );
  }

  // Empty State
  if (cvs.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon-wrapper">
          <FileText size={32} />
        </div>
        <h3 className="empty-title">No hay CVs registrados</h3>
        <p className="empty-message">
          Aún no has subido ningún CV. Ve a "Analizador de CV" para comenzar.
        </p>
      </div>
    );
  }

  // Main Content
  return (
    <div className="historial-container">
      {/* Header */}
      <div className="historial-header">
        <div className="header-content-wrapper">
          <div className="header-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="header-text">
            <h2 className="historial-title">Historial de CVs</h2>
            <p className="historial-subtitle">
              {filteredCVs.length} CV{filteredCVs.length !== 1 ? 's' : ''} encontrado{filteredCVs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="historial-filters">
        {/* Search */}
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre de archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-buttons">
          {['all', 'procesado', 'pendiente'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
            >
              {status === 'all' ? 'Todos' : status === 'procesado' ? 'Procesados' : 'Pendientes'}
            </button>
          ))}
        </div>
      </div>

      {/* CVs Grid */}
      <div className="cvs-grid">
        <AnimatePresence>
          {filteredCVs.map((cv, index) => {
            const isProcessed = !!cv.contenido_extraido;
            const filename = cv.archivo || cv.nombre_archivo || cv.filename || 'CV sin nombre';
            const abbreviatedName = abbreviateFilename(filename, 35);
            
            return (
              <motion.div
                key={cv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="cv-card"
              >
                {/* CV Header */}
                <div className="cv-card-header">
                  <div className={`cv-icon ${isProcessed ? 'procesado' : 'pendiente'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="cv-info">
                    <h3 
                      className="cv-filename" 
                      title={filename} // 👈 Tooltip con nombre completo
                    >
                      {abbreviatedName}
                    </h3>
                    <div className="cv-date">
                      <Calendar size={14} />
                      <span>{formatDate(cv.fecha_creacion || cv.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`status-badge ${isProcessed ? 'procesado' : 'pendiente'}`}>
                  {isProcessed ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {isProcessed ? 'Procesado' : 'Pendiente'}
                </div>

                {/* Actions */}
                <div className="cv-actions">
                  <button 
                    onClick={() => handleViewCV(cv)} 
                    className="action-btn view-btn"
                    title="Ver CV"
                  >
                    <Eye size={16} />
                    Ver
                  </button>
                  <button
                    onClick={() => handleDeleteCV(cv.id)}
                    disabled={deletingId === cv.id}
                    className="action-btn delete-btn"
                    title="Eliminar CV"
                  >
                    <Trash2 size={16} />
                    {deletingId === cv.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredCVs.length === 0 && cvs.length > 0 && (
        <div className="empty-results">
          <AlertCircle size={48} />
          <p>No se encontraron CVs con los filtros aplicados</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="btn-analyze"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialCV;