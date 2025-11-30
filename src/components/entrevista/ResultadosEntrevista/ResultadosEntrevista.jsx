// src/components/ResultadosEntrevista.jsx
import { motion } from 'framer-motion';
import Background from '../../layout/Background/Background';
import {
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Award,
  Target,
  BarChart3,
  Calendar,
  MessageSquare,
  Star,
  AlertCircle,
  Lightbulb,
  Trophy
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../../../styles/components/entrevista/ResultadosEntrevista.css';

const ResultadosEntrevista = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    console.log('📍 ResultadosEntrevista - location.state:', location.state);

    if (location.state?.resultados) {
      console.log('✅ Datos recibidos:', location.state.resultados);
      setResultados(location.state.resultados);
      setCargando(false);
    } else {
      console.warn('❌ No hay datos de resultados');
      setTimeout(() => {
        navigate('/entrevista', { replace: true });
      }, 2000);
    }
  }, [location.state, navigate]);

  const handleVolverEntrevista = () => {
    navigate('/entrevista', { replace: true });
  };

  if (cargando) {
    return (
      <div className="resultado-container">
        <Background />
        <div className="loading-spinner">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="spinner-circle"
          >
            ⏳
          </motion.div>
          <p>Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!resultados) {
    return (
      <div className="resultado-container">
        <Background />
        <div className="error-box">
          <p>❌ No se encontraron resultados. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Extraer puntuación
  const puntuacion = resultados.puntuacion_global || 0;
  const nivel = resultados.nivel_desempenio || 'Regular';
  const fortalezas = resultados.fortalezas || [];
  const areasMejora = resultados.areas_mejora || [];
  const comentario = resultados.comentario_final || 'No hay comentarios disponibles';
  const metricas = resultados.metricas_puntuacion || {};

  // Función para obtener color según puntuación
  const getColorPuntuacion = (score) => {
    if (score >= 90) return '#10b981'; // Verde excelente
    if (score >= 80) return '#3b82f6'; // Azul muy bueno
    if (score >= 70) return '#f59e0b'; // Naranja bueno
    if (score >= 60) return '#ef4444'; // Rojo regular
    return '#6b7280'; // Gris deficiente
  };

  const colorPuntuacion = getColorPuntuacion(puntuacion);

  console.log('📊 Puntuación final:', puntuacion);
  console.log('📈 Nivel:', nivel);

  return (
    <>
      <Background />
      <div style={{
        minHeight: '100vh',
        padding: '2rem 1rem',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* TITULO CON ANIMACIÓN */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="resultado-header"
          >
            <Trophy size={28} style={{ color: '#667eea' }} />
            <h1>Resultados de tu Entrevista</h1>
            <p className="resultado-subtitle">Análisis detallado de tu desempeño</p>
          </motion.div>

          {/* CARD PRINCIPAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="resultado-card"
          >

            {/* SECCIÓN DE PUNTUACIÓN PRINCIPAL */}
            <div className="puntuacion-section">
              <motion.div
                className="puntuacion-circle"
                style={{ borderColor: colorPuntuacion }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="puntuacion-valor" style={{ color: colorPuntuacion }}>
                  {Math.round(puntuacion)}
                </span>
                <span className="puntuacion-max">/100</span>
              </motion.div>

              <div className="nivel-desempenio">
                <span className="nivel-label">Nivel de Desempeño</span>
                <motion.span
                  className={`nivel-badge nivel-${nivel.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ backgroundColor: colorPuntuacion }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {nivel}
                </motion.span>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${puntuacion}%`,
                      backgroundColor: colorPuntuacion
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE MÉTRICAS */}
            {metricas && Object.keys(metricas).length > 0 && (
              <motion.div
                className="metricas-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3>📈 Desglose de Competencias</h3>
                <div className="metricas-grid">
                  {Object.entries(metricas).map(([key, value], idx) => (
                    <div key={idx} className="metrica-item">
                      <div className="metrica-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      <div className="metrica-valor">{value}/20</div>
                      <div className="metrica-bar">
                        <div
                          className="metrica-fill"
                          style={{ width: `${(value / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SECCIÓN DE COMENTARIO */}
            {comentario && (
              <motion.div
                className="feedback-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="feedback-header">
                  <MessageSquare size={24} />
                  <h2>Evaluación General</h2>
                </div>
                <p className="feedback-text">{comentario}</p>
              </motion.div>
            )}

            {/* SECCIÓN DE FORTALEZAS */}
            {fortalezas && fortalezas.length > 0 && (
              <motion.div
                className="fortalezas-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="seccion-header">
                  <Star size={24} />
                  <h3>Fortalezas Identificadas</h3>
                </div>
                <ul className="lista-items">
                  {fortalezas.map((fortaleza, idx) => (
                    <motion.li
                      key={idx}
                      className="item-fortaleza"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      <span className="icono">✓</span>
                      <span>{fortaleza}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* SECCIÓN DE ÁREAS DE MEJORA */}
            {areasMejora && areasMejora.length > 0 && (
              <motion.div
                className="mejora-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="seccion-header">
                  <Lightbulb size={24} />
                  <h3>Áreas de Mejora</h3>
                </div>
                <ul className="lista-items">
                  {areasMejora.map((mejora, idx) => (
                    <motion.li
                      key={idx}
                      className="item-mejora"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                    >
                      <span className="icono">→</span>
                      <span>{mejora}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* DETALLES */}
            <motion.div
              className="detalles-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="detalle-item">
                <BarChart3 size={20} />
                <span className="detalle-label">Carrera:</span>
                <span className="detalle-valor">{resultados.carrera || 'N/A'}</span>
              </div>
              <div className="detalle-item">
                <Calendar size={20} />
                <span className="detalle-label">Fecha:</span>
                <span className="detalle-valor">{resultados.fecha_entrevista || new Date().toLocaleDateString('es-ES')}</span>
              </div>
              <div className="detalle-item">
                <MessageSquare size={20} />
                <span className="detalle-label">Preguntas Respondidas:</span>
                <span className="detalle-valor">{resultados.estadisticas?.total_respuestas || 0}</span>
              </div>
            </motion.div>

            {/* BOTONES */}
            <motion.div
              className="botones-resultado"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                onClick={handleVolverEntrevista}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <RefreshCw size={20} />
                Nueva Entrevista
              </button>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </>
  );
};

export default ResultadosEntrevista;
