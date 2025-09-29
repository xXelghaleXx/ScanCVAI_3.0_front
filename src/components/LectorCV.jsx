import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Download, Search, FileText } from "lucide-react";
import { toast } from 'react-toastify';
import '../styles/LectorCV.css';

// Hook personalizado para el efecto de escritura tipo Gemini
const useGeminiTypewriter = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);

  const typeText = (text, options = {}) => {
    const { 
      speed = 8,
      pauseAfterPunctuation = 40,
      pauseAfterComma = 20,
      showThinkingTime = 300
    } = options;

    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    setTimeout(() => {
      const typeCharacter = () => {
        if (indexRef.current < text.length) {
          const char = text[indexRef.current];
          
          setDisplayedText(prev => prev + char);
          
          let delay = speed + Math.random() * 10;
          
          if (indexRef.current > 0) {
            const prevChar = text[indexRef.current - 1];
            if (/[.!?]/.test(prevChar)) {
              delay += pauseAfterPunctuation;
            } else if (prevChar === ',') {
              delay += pauseAfterComma;
            } else if (char === ' ') {
              delay = Math.max(5, delay * 0.3);
            }
          }
          
          indexRef.current++;
          timeoutRef.current = setTimeout(typeCharacter, delay);
        } else {
          setIsTyping(false);
        }
      };
      
      typeCharacter();
    }, showThinkingTime);
  };

  const stopTyping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsTyping(false);
  };

  const resetText = () => {
    stopTyping();
    setDisplayedText("");
    indexRef.current = 0;
  };

  return { displayedText, isTyping, typeText, stopTyping, resetText };
};

// Componente de puntos de "pensando"
const ThinkingDots = () => (
  <motion.div
    className="thinking-dots"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="thinking-dot"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          margin: '0 2px',
          display: 'inline-block'
        }}
      />
    ))}
  </motion.div>
);

// Componente de Empty State
const EmptyStateIllustration = () => (
  <motion.svg
    className="empty-state-svg"
    width="200"
    height="150"
    viewBox="0 0 200 150"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.rect
      x="30"
      y="60"
      width="140"
      height="80"
      rx="8"
      fill="#f8fafc"
      stroke="#e2e8f0"
      strokeWidth="2"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    />
    
    <motion.path
      d="M30 60 L30 52 Q30 48 34 48 L80 48 Q84 48 86 52 L94 60 Z"
      fill="#e2e8f0"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    />
    
    <motion.g
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <path
        d="M85 85 Q75 75 90 75 Q95 70 105 75 Q115 70 125 75 Q135 75 125 85 Z"
        fill="#6c757d"
        opacity="0.8"
      />
      <circle cx="100" cy="82" r="8" fill="#6c757d" opacity="0.6" />
    </motion.g>
    
    <motion.g
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
    >
      <path
        d="M100 95 L100 105 M95 100 L100 95 L105 100"
        stroke="#6c757d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </motion.g>
    
    <motion.g
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="45" y="30" width="20" height="25" rx="2" fill="#10b981" opacity="0.7" />
      <rect x="48" y="33" width="14" height="2" rx="1" fill="white" />
      <rect x="48" y="37" width="10" height="2" rx="1" fill="white" />
      <rect x="48" y="41" width="12" height="2" rx="1" fill="white" />
    </motion.g>
    
    <motion.g
      animate={{ y: [2, -2, 2] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <rect x="135" y="35" width="20" height="25" rx="2" fill="#f59e0b" opacity="0.7" />
      <rect x="138" y="38" width="14" height="2" rx="1" fill="white" />
      <rect x="138" y="42" width="10" height="2" rx="1" fill="white" />
      <rect x="138" y="46" width="12" height="2" rx="1" fill="white" />
    </motion.g>
  </motion.svg>
);

// Componente de Loading con esferas
const LoadingSpheresAnimation = ({ text = "Procesando..." }) => (
  <motion.div
    className="loading-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem'
    }}
  >
    <div className="loading-spheres" style={{ display: 'flex', gap: '0.5rem' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="loading-sphere"
          animate={{
            y: [-8, 8, -8],
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)'
          }}
        />
      ))}
    </div>
    <motion.p
      className="loading-text"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{ color: 'var(--text-secondary)', fontWeight: '500' }}
    >
      {text}
    </motion.p>
  </motion.div>
);

// Componente principal
const LectorCV = () => {
  const [cvUploaded, setCvUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [cvId, setCvId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [analysisText, setAnalysisText] = useState("");
  const [loadingText, setLoadingText] = useState("Procesando...");
  const [analysisData, setAnalysisData] = useState(null);

  // Usar nuestro hook personalizado de escritura
  const { displayedText, isTyping, typeText, resetText } = useGeminiTypewriter();

  // Ejecutar efecto de escritura cuando el análisis esté listo
  useEffect(() => {
    if (reportReady && analysisText) {
      typeText(analysisText, {
        speed: 8,
        pauseAfterPunctuation: 40,
        pauseAfterComma: 20,
        showThinkingTime: 400
      });
    }
  }, [reportReady, analysisText]);

  // RF-100: Subir CV
  const uploadCVToAPI = async (file) => {
    setLoading(true);
    setLoadingText("Subiendo CV...");
    
    try {
      console.log('📤 Subiendo CV:', file.name);
      
      const formData = new FormData();
      formData.append('cv', file);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }
      
      const response = await fetch('http://localhost:3000/api/cv/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error subiendo CV');
      }
      
      const data = await response.json();
      console.log('✅ CV subido exitosamente:', data);
      
      // Actualizar estado tras subida exitosa
      setCvUploaded(true);
      setFileName(file.name);
      setCvId(data.cv.id);
      setUploadError(null);
      
      toast.success('CV subido correctamente');
      return data;
      
    } catch (error) {
      console.error('❌ Error subiendo CV:', error);
      setUploadError(error.message);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // RF-102: Procesar CV con IA
  const analyzeCV = async () => {
    if (!cvId) {
      const errorMsg = "Primero sube un CV antes de analizarlo.";
      setUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setLoadingText("Analizando con IA...");
    resetText();
    
    try {
      console.log('🧠 Procesando CV con IA:', cvId);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }
      
      const response = await fetch(`http://localhost:3000/api/cv/${cvId}/procesar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error analizando CV');
      }
      
      const data = await response.json();
      console.log('✅ Análisis completado:', data);

      // Extraer datos del análisis
      const { analisis, validation, processing_time } = data;
      
      setAnalysisData({
        ...analisis,
        validation,
        processing_time
      });

      // Crear texto para mostrar en pantalla
      const analysisDisplayText = formatAnalysisForDisplay(analisis, validation);
      setAnalysisText(analysisDisplayText);
      setReportReady(true);
      setUploadError(null);
      
      toast.success('Análisis completado correctamente');
    } catch (error) {
      console.error('❌ Error analizando CV:', error);
      setUploadError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // RF-103: Generar informe detallado
  const generateReport = async () => {
    if (!cvId) {
      const errorMsg = "No hay CV para generar informe.";
      setUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setLoadingText("Generando informe detallado...");
    
    try {
      console.log('📊 Generando informe para CV:', cvId);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }
      
      const response = await fetch(`http://localhost:3000/api/cv/${cvId}/informe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generando informe');
      }
      
      const data = await response.json();
      console.log('✅ Informe generado:', data);

      setReportId(data.informe.id);
      setUploadError(null);
      
      toast.success('Informe generado correctamente');
    } catch (error) {
      console.error('❌ Error generando informe:', error);
      setUploadError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear análisis para mostrar
  const formatAnalysisForDisplay = (analisis, validation) => {
    let text = "📋 **ANÁLISIS DE CV COMPLETADO**\n\n";
    
    // Validación
    if (validation) {
      text += `**Puntuación de Validación:** ${validation.score}/100\n`;
      text += `**Estado:** ${validation.is_valid ? '✅ Válido' : '⚠️ Necesita mejoras'}\n\n`;
    }

    // Fortalezas
    if (analisis.fortalezas && analisis.fortalezas.length > 0) {
      text += "🌟 **FORTALEZAS IDENTIFICADAS:**\n";
      analisis.fortalezas.forEach((fortaleza, index) => {
        text += `${index + 1}. ${fortaleza}\n`;
      });
      text += "\n";
    }

    // Habilidades técnicas
    if (analisis.habilidades_tecnicas && analisis.habilidades_tecnicas.length > 0) {
      text += "💻 **HABILIDADES TÉCNICAS:**\n";
      text += analisis.habilidades_tecnicas.join(", ") + "\n\n";
    }

    // Habilidades blandas
    if (analisis.habilidades_blandas && analisis.habilidades_blandas.length > 0) {
      text += "🤝 **HABILIDADES BLANDAS:**\n";
      text += analisis.habilidades_blandas.join(", ") + "\n\n";
    }

    // Experiencia
    if (analisis.experiencia_resumen) {
      text += "💼 **RESUMEN DE EXPERIENCIA:**\n";
      text += analisis.experiencia_resumen + "\n\n";
    }

    // Educación
    if (analisis.educacion_resumen) {
      text += "🎓 **RESUMEN DE EDUCACIÓN:**\n";
      text += analisis.educacion_resumen + "\n\n";
    }

    // Áreas de mejora
    if (analisis.areas_mejora && analisis.areas_mejora.length > 0) {
      text += "🔧 **ÁREAS DE MEJORA:**\n";
      analisis.areas_mejora.forEach((area, index) => {
        text += `${index + 1}. ${area}\n`;
      });
      text += "\n";
    }

    text += "📊 **¿Quieres un informe más detallado?** Haz clic en 'Generar Informe Completo' para obtener un análisis PDF descargable.";

    return text;
  };

  // Descargar informe en PDF (simulado - el backend devuelve JSON actualmente)
  const downloadReport = async () => {
  if (!reportId) {
    // Si no hay reportId, generar el informe primero
    await generateReport();
    return;
  }

  try {
    console.log('📥 Descargando informe:', reportId);
    
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }
    
    const response = await fetch(`http://localhost:3000/api/informes/${reportId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Para errores, sí intentamos leer JSON
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error descargando informe');
    }
    
    // CAMBIO PRINCIPAL: Leer como blob, no como JSON
    const blob = await response.blob();
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Informe_CV_${fileName || 'analisis'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Informe descargado correctamente');
    
  } catch (error) {
    console.error('❌ Error descargando informe:', error);
    setUploadError(error.message);
    toast.error(error.message);
  }
};

  // Cancelar/Eliminar CV
  const handleCancel = async () => {
    if (!cvId) {
      const errorMsg = "No hay un CV para cancelar.";
      setUploadError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setLoadingText("Cancelando...");
    
    try {
      console.log('🗑️ Eliminando CV:', cvId);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }
      
      const response = await fetch(`http://localhost:3000/api/cv/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error eliminando CV');
      }
      
      console.log('✅ CV eliminado con éxito');

      // Reset del estado
      setCvUploaded(false);
      setFileName("");
      setCvId(null);
      setReportReady(false);
      setReportId(null);
      setAnalysisText("");
      setAnalysisData(null);
      resetText();
      setUploadError(null);
      
      toast.success('CV eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando CV:', error);
      setUploadError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar subida de archivo
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validaciones del archivo
      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Solo se permiten archivos PDF y DOCX.");
        toast.error("Solo se permiten archivos PDF y DOCX.");
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadError("El archivo no puede ser mayor a 10MB.");
        toast.error("El archivo no puede ser mayor a 10MB.");
        return;
      }

      setUploadError(null);
      uploadCVToAPI(file);
    }
  };

  return (
    <div className="lector-cv-content">
      {/* Lector de CV (Izquierda) */}
      <motion.div
        className="cv-panel"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <LoadingSpheresAnimation text={loadingText} />
        ) : cvUploaded ? (
          <motion.div
            className="uploaded-file"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <FileText size={48} style={{ color: 'var(--secondary)' }} />
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Archivo subido
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {fileName}
              </p>
            </div>
            <CheckCircle size={24} style={{ color: 'var(--secondary)' }} />
          </motion.div>
        ) : (
          <label className="upload-label">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              hidden
            />
            <EmptyStateIllustration />
            <motion.span
              className="upload-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              Arrastra tu CV aquí o haz clic para subir
            </motion.span>
            <motion.span
              className="upload-subtext"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
            >
              Formatos soportados: PDF, DOCX (máx. 10MB)
            </motion.span>
          </label>
        )}

        {uploadError && (
          <motion.p
            className="error-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: 'var(--error)',
              textAlign: 'center',
              margin: '1rem 0',
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {uploadError}
          </motion.p>
        )}

        {/* Barra de revisión */}
        {cvUploaded && !loading && (
          <motion.div
            className="review-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '2rem'
            }}
          >
            <motion.button
              className="btn-analyze"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeCV}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              <Search size={20} /> Analizar CV con IA
            </motion.button>
            
            <motion.button
              className="btn-cancel"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: 'var(--error)',
                border: '2px solid var(--error)',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              <X size={20} /> Cancelar
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Panel de Análisis (Derecha) */}
      <AnimatePresence>
        {reportReady && (
          <motion.div
            className="analysis-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              background: 'var(--bg-primary)',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              minHeight: '500px'
            }}
          >
            <h3 
              className="analysis-title"
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Análisis del CV
              {isTyping && <ThinkingDots />}
            </h3>
            
            <div 
              className="analysis-content"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.7',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                fontFamily: 'inherit'
              }}
            >
              {displayedText}
              {isTyping && (
                <motion.span
                  className="typing-cursor"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1em',
                    backgroundColor: 'var(--primary)',
                    marginLeft: '2px'
                  }}
                />
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <motion.button
                className="download-btn"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadReport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Download size={18} /> Generar Informe PDF
              </motion.button>
              
              {!reportId && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateReport}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📊 Informe Completo
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LectorCV;