import { motion } from "framer-motion";
import { Award, TrendingUp, CheckCircle, AlertCircle, Download } from "lucide-react";
import './CVScorePanel.css';

const CVScorePanel = ({ scoringData, onDownloadReport }) => {
  const { puntuacion_final, es_cv_ideal, nivel_cv, metricas, analisis_metricas, recomendacion } = scoringData;

  // Determinar color basado en puntuación
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#f59e0b'; // Naranja
    return '#ef4444'; // Rojo
  };

  const scoreColor = getScoreColor(puntuacion_final);

  // Renderizar barra de métrica
  const MetricBar = ({ label, value, maxValue = 100 }) => {
    const percentage = (value / maxValue) * 100;
    const barColor = getScoreColor(value);

    return (
      <div className="metric-bar-container">
        <div className="metric-bar-header">
          <span className="metric-label">{label}</span>
          <span className="metric-value">{value}/{maxValue}</span>
        </div>
        <div className="metric-bar-track">
          <motion.div
            className="metric-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            style={{ backgroundColor: barColor }}
          />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="cv-score-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header con puntuación principal */}
      <motion.div
        className="score-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="score-icon-container">
          {es_cv_ideal ? (
            <Award size={48} style={{ color: scoreColor }} />
          ) : (
            <TrendingUp size={48} style={{ color: scoreColor }} />
          )}
        </div>

        <motion.div
          className="score-circle"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Fondo del círculo */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />

            {/* Círculo de progreso */}
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: puntuacion_final / 100 }}
              transition={{ delay: 0.6, duration: 1.5, ease: "easeInOut" }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                strokeDasharray: "440",
                strokeDashoffset: 440
              }}
            />
          </svg>

          {/* Puntuación */}
          <div className="score-value">
            <motion.span
              className="score-number"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {puntuacion_final}
            </motion.span>
            <span className="score-max">/100</span>
          </div>
        </motion.div>

        <motion.div
          className="score-level"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <h2 style={{ color: scoreColor }}>{nivel_cv}</h2>
          <p className="score-recommendation">{recomendacion}</p>
        </motion.div>
      </motion.div>

      {/* Métricas detalladas */}
      <motion.div
        className="metrics-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h3 className="section-title">Métricas Detalladas</h3>

        <div className="metrics-grid">
          <MetricBar label="Completitud" value={metricas.completitud} />
          <MetricBar label="Calidad de Contenido" value={metricas.calidad_contenido} />
          <MetricBar label="Formato y Estructura" value={metricas.formato_estructura} />
          <MetricBar label="Experiencia y Educación" value={metricas.experiencia_educacion} />
        </div>
      </motion.div>

      {/* Análisis detallado */}
      <motion.div
        className="analysis-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h3 className="section-title">Análisis del CV</h3>

        <div className="analysis-list">
          {analisis_metricas.analisis_detallado.map((item, index) => {
            const isPositive = item.startsWith('✅');
            const isWarning = item.startsWith('⚠️');

            return (
              <motion.div
                key={index}
                className={`analysis-item ${isPositive ? 'positive' : isWarning ? 'warning' : 'negative'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
              >
                {isPositive ? (
                  <CheckCircle size={20} className="item-icon positive-icon" />
                ) : (
                  <AlertCircle size={20} className="item-icon warning-icon" />
                )}
                <span className="item-text">{item}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Siguiente paso */}
      <motion.div
        className="next-step-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <div className="next-step-content">
          <h4>Siguiente Paso</h4>
          <p>{analisis_metricas.siguiente_paso}</p>
        </div>

        {!es_cv_ideal && (
          <motion.button
            className="download-report-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownloadReport}
          >
            <Download size={18} />
            Descargar Informe de Mejoras
          </motion.button>
        )}
      </motion.div>

      {/* Badge de CV Ideal */}
      {es_cv_ideal && (
        <motion.div
          className="ideal-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
        >
          <Award size={24} />
          <span>CV Ideal</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CVScorePanel;
