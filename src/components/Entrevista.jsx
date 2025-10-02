import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  TrendingUp,
  Sparkles,
  AlertCircle
} from "lucide-react";
import ChatBox from "./Chatbox";
import ChatInput from "./Chatinput";
import entrevistaService from "../services/entrevistaService";
import "../styles/Chat.css";

const EntrevistaChat = () => {
  // Estados principales
  const [entrevistaId, setEntrevistaId] = useState(null);
  const [chat, setChat] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entrevistaFinalizada, setEntrevistaFinalizada] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [showDiagnostico, setShowDiagnostico] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  
  const chatBoxRef = useRef(null);

  // ========== INICIAR ENTREVISTA ==========
  useEffect(() => {
    const entrevistaGuardada = entrevistaService.recuperarEntrevistaLocal();
    
    if (entrevistaGuardada.success) {
      const { id, chatHistory } = entrevistaGuardada.data;
      setEntrevistaId(id);
      setChat(chatHistory || []);
      console.log('✅ Entrevista recuperada:', id);
    } else {
      iniciarNuevaEntrevista();
    }
  }, []);

  // Guardar estado automáticamente
  useEffect(() => {
    if (entrevistaId && chat.length > 0 && !entrevistaFinalizada) {
      entrevistaService.guardarEntrevistaLocal(entrevistaId, chat);
    }
  }, [entrevistaId, chat, entrevistaFinalizada]);

  // ========== FUNCIÓN: INICIAR NUEVA ENTREVISTA ==========
  const iniciarNuevaEntrevista = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Iniciando nueva entrevista...');
      
      const result = await entrevistaService.iniciarEntrevista();

      if (result.success) {
        const { entrevista_id, mensaje: mensajeBienvenida } = result.data;
        
        setEntrevistaId(entrevista_id);
        setChat([{ 
          tipo: "ia", 
          texto: mensajeBienvenida || "¡Hola! Soy tu asistente de entrevistas. Estoy aquí para ayudarte a practicar. ¿Listo para comenzar?"
        }]);
        setEntrevistaFinalizada(false);
        
        console.log('✅ Entrevista iniciada:', entrevista_id);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Error al iniciar entrevista:', error);
      setError(error.message || 'Error al iniciar la entrevista');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: ENVIAR MENSAJE ==========
  const handleEnviarMensaje = async () => {
    if (mensaje.trim() === "") return;
    if (!entrevistaId) {
      setError("No se ha iniciado una entrevista");
      return;
    }
    if (entrevistaFinalizada) {
      setError("La entrevista ya ha finalizado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Agregar mensaje del usuario inmediatamente
      const mensajeUsuario = { tipo: "usuario", texto: mensaje };
      setChat(prevChat => [...prevChat, mensajeUsuario]);
      setMensaje("");

      console.log('📤 Enviando mensaje:', mensaje);

      const result = await entrevistaService.enviarMensaje(entrevistaId, mensaje);

      if (result.success) {
        const { respuesta, finalizada } = result.data;

        // Agregar respuesta de la IA
        if (respuesta) {
          setTimeout(() => {
            setChat(prevChat => [...prevChat, {
              tipo: "ia",
              texto: respuesta
            }]);
          }, 500);
        }

        // Verificar si la entrevista finalizó
        if (finalizada) {
          setTimeout(() => {
            finalizarEntrevista();
          }, 1000);
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      setError(error.message || 'Error al enviar tu respuesta');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: FINALIZAR ENTREVISTA ==========
  const finalizarEntrevista = async () => {
    if (!entrevistaId) return;

    try {
      setLoading(true);
      
      console.log('🏁 Finalizando entrevista...');
      
      const result = await entrevistaService.finalizarEntrevista(entrevistaId);

      if (result.success) {
        setEntrevistaFinalizada(true);
        setEstadisticas(result.data.estadisticas);
        
        setChat(prevChat => [...prevChat, {
          tipo: "ia",
          texto: "¡Excelente trabajo! La entrevista ha finalizado. Puedes ver tu diagnóstico detallado haciendo clic en el botón inferior."
        }]);

        entrevistaService.limpiarEntrevistaLocal();
        
        console.log('✅ Entrevista finalizada');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al finalizar entrevista:', error);
      setError(error.message || 'Error al finalizar la entrevista');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: OBTENER DIAGNÓSTICO ==========
  const obtenerDiagnostico = async () => {
    if (!entrevistaId) return;

    try {
      setLoading(true);
      
      console.log('📊 Obteniendo diagnóstico...');
      
      const result = await entrevistaService.obtenerDiagnostico(entrevistaId);

      if (result.success) {
        setDiagnostico(result.data);
        setShowDiagnostico(true);
        console.log('✅ Diagnóstico obtenido');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al obtener diagnóstico:', error);
      setError(error.message || 'Error al obtener diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: ABANDONAR ENTREVISTA ==========
  const abandonarEntrevista = async () => {
    if (!entrevistaId) return;
    
    const confirmacion = window.confirm("¿Estás seguro de que deseas abandonar la entrevista?");
    if (!confirmacion) return;

    try {
      setLoading(true);
      
      console.log('🚪 Abandonando entrevista...');
      
      const result = await entrevistaService.abandonarEntrevista(entrevistaId);

      if (result.success) {
        entrevistaService.limpiarEntrevistaLocal();
        
        // Reiniciar estado
        setEntrevistaId(null);
        setChat([]);
        setEntrevistaFinalizada(false);
        setEstadisticas(null);
        setDiagnostico(null);
        setShowDiagnostico(false);
        
        // Iniciar nueva entrevista
        iniciarNuevaEntrevista();
        
        console.log('✅ Entrevista abandonada');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al abandonar entrevista:', error);
      setError(error.message || 'Error al abandonar entrevista');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entrevista-container">
      {/* Header */}
      <motion.div 
        className="entrevista-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content-wrapper">
          <div className="header-icon-wrapper">
            <MessageCircle size={24} />
          </div>
          <div className="header-text">
            <h2 className="entrevista-title">Simulador de Entrevista con IA</h2>
            <p className="entrevista-subtitle">
              Practica y mejora tus habilidades de entrevista
            </p>
          </div>
        </div>
        
        {entrevistaId && !entrevistaFinalizada && (
          <div className="entrevista-actions">
            <button 
              className="btn-secondary-small"
              onClick={finalizarEntrevista}
              disabled={loading}
            >
              Finalizar
            </button>
            <button 
              className="btn-danger-small"
              onClick={abandonarEntrevista}
              disabled={loading}
            >
              Abandonar
            </button>
          </div>
        )}
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

      {/* Chat Container */}
      <div className="chat-main-container">
        <ChatBox 
          chat={chat}
          loading={loading}
          preguntaInicial="¡Hola! Estoy aquí para ayudarte a practicar tus habilidades de entrevista."
          ref={chatBoxRef}
        />

        <ChatInput
          mensaje={mensaje}
          setMensaje={setMensaje}
          onEnviar={handleEnviarMensaje}
          disabled={loading || entrevistaFinalizada || !entrevistaId}
          loading={loading}
        />
      </div>

      {/* Estadísticas y Diagnóstico */}
      {entrevistaFinalizada && (
        <motion.div 
          className="entrevista-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {estadisticas && (
            <div className="estadisticas-card">
              <h3 className="estadisticas-title">
                <TrendingUp size={20} />
                Resumen de la Entrevista
              </h3>
              <div className="estadisticas-grid">
                <div className="stat-item">
                  <MessageCircle size={18} />
                  <div className="stat-content">
                    <span className="stat-label">Mensajes</span>
                    <span className="stat-value">{estadisticas.total_mensajes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={obtenerDiagnostico}
              disabled={loading || showDiagnostico}
            >
              <Sparkles size={18} />
              Ver Diagnóstico Detallado
            </button>
            <button 
              className="btn-secondary"
              onClick={iniciarNuevaEntrevista}
              disabled={loading}
            >
              <MessageCircle size={18} />
              Nueva Entrevista
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de Diagnóstico */}
      <AnimatePresence>
        {showDiagnostico && diagnostico && (
          <motion.div 
            className="diagnostico-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDiagnostico(false)}
          >
            <motion.div 
              className="diagnostico-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  <Sparkles size={24} />
                  Diagnóstico Detallado
                </h3>
                <button 
                  className="close-button"
                  onClick={() => setShowDiagnostico(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                {diagnostico.fortalezas && diagnostico.fortalezas.length > 0 && (
                  <div className="diagnostico-section">
                    <h4 className="section-title success">
                      ✓ Fortalezas Identificadas
                    </h4>
                    <ul className="diagnostico-list">
                      {diagnostico.fortalezas.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnostico.areas_mejora && diagnostico.areas_mejora.length > 0 && (
                  <div className="diagnostico-section">
                    <h4 className="section-title warning">
                      ⚠ Áreas de Mejora
                    </h4>
                    <ul className="diagnostico-list">
                      {diagnostico.areas_mejora.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnostico.recomendaciones && diagnostico.recomendaciones.length > 0 && (
                  <div className="diagnostico-section">
                    <h4 className="section-title info">
                      💡 Recomendaciones
                    </h4>
                    <ul className="diagnostico-list">
                      {diagnostico.recomendaciones.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnostico.puntuacion_general && (
                  <div className="puntuacion-general">
                    <h4>Puntuación General</h4>
                    <div className="puntuacion-bar">
                      <motion.div 
                        className="puntuacion-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${diagnostico.puntuacion_general}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="puntuacion-value">
                      {diagnostico.puntuacion_general}%
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-primary"
                  onClick={() => setShowDiagnostico(false)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EntrevistaChat;