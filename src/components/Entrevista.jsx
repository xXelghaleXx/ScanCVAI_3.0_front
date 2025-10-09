// src/components/Entrevista.jsx - VERSIÓN CORREGIDA
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  AlertCircle
} from "lucide-react";
import { toast } from 'react-toastify';
import ChatBox from "./Chatbox";
import ChatInput from "./Chatinput";
import CarreraSelector from "./CarreraSelector";
import ResultadosEntrevista from "./ResultadosEntrevista";
import Background from "./Background";
import entrevistaService from "../services/entrevistaService";
import "../styles/Chat.css";

const EntrevistaChat = () => {
  // ========== ESTADOS PRINCIPALES ==========
  const [entrevistaId, setEntrevistaId] = useState(null);
  const [chat, setChat] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados del flujo
  const [mostrarSelectorCarrera, setMostrarSelectorCarrera] = useState(true);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [dificultadSeleccionada, setDificultadSeleccionada] = useState(null);
  const [entrevistaFinalizada, setEntrevistaFinalizada] = useState(false);
  const [resultados, setResultados] = useState(null);
  
  const chatBoxRef = useRef(null);

  // ========== VERIFICAR ENTREVISTA EXISTENTE AL CARGAR ==========
  useEffect(() => {
    verificarEntrevistaExistente();
  }, []);

  const verificarEntrevistaExistente = async () => {
    console.log('🔍 Verificando entrevista guardada...');

    // 1. Primero verificar localStorage
    const entrevistaGuardada = entrevistaService.recuperarEntrevistaLocal();

    if (entrevistaGuardada.success) {
      const { id, chatHistory, carrera, dificultad } = entrevistaGuardada.data;

      console.log('✅ Entrevista recuperada de localStorage:');
      console.log('  🆔 ID:', id);
      console.log('  💬 Mensajes:', chatHistory?.length || 0);
      console.log('  📚 Carrera:', carrera?.nombre || 'N/A');
      console.log('  📊 Dificultad:', dificultad?.nombre || 'N/A');

      setEntrevistaId(id);
      setChat(chatHistory || []);
      setCarreraSeleccionada(carrera);
      setDificultadSeleccionada(dificultad);
      setMostrarSelectorCarrera(false);

      toast.info('Continuando entrevista anterior');
      return;
    }

    // 2. Si no hay en localStorage, verificar en el backend
    console.log('📡 Consultando backend por entrevista activa...');
    const entrevistaActiva = await entrevistaService.obtenerEntrevistaActiva();

    if (entrevistaActiva.success && entrevistaActiva.data) {
      console.log('✅ Entrevista activa encontrada en backend:', entrevistaActiva.data);

      // Obtener historial de la entrevista
      const historial = await entrevistaService.obtenerHistorialEntrevista(entrevistaActiva.data.id);

      if (historial.success) {
        const chatHistory = historial.data.mensajes || [];

        setEntrevistaId(entrevistaActiva.data.id);
        setChat(chatHistory);
        setCarreraSeleccionada({
          id: entrevistaActiva.data.carrera_id,
          nombre: entrevistaActiva.data.carrera || 'Carrera'
        });
        setDificultadSeleccionada({
          id: entrevistaActiva.data.dificultad,
          nombre: entrevistaActiva.data.dificultad || 'N/A'
        });
        setMostrarSelectorCarrera(false);

        // Guardar en localStorage para futuras cargas
        entrevistaService.guardarEntrevistaLocal(
          entrevistaActiva.data.id,
          chatHistory,
          { id: entrevistaActiva.data.carrera_id, nombre: entrevistaActiva.data.carrera },
          { id: entrevistaActiva.data.dificultad, nombre: entrevistaActiva.data.dificultad }
        );

        toast.info('Continuando entrevista activa');
      } else {
        console.log('📝 No hay entrevista activa');
        setMostrarSelectorCarrera(true);
      }
    } else {
      console.log('📝 No hay entrevista activa');
      setMostrarSelectorCarrera(true);
    }
  };

  // ========== GUARDAR ESTADO AUTOMÁTICAMENTE ==========
  useEffect(() => {
    if (entrevistaId && chat.length > 0 && !entrevistaFinalizada) {
      entrevistaService.guardarEntrevistaLocal(
        entrevistaId, 
        chat, 
        carreraSeleccionada, 
        dificultadSeleccionada
      );
    }
  }, [entrevistaId, chat, entrevistaFinalizada, carreraSeleccionada, dificultadSeleccionada]);

  // ========== SCROLL AUTOMÁTICO ==========
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // ========== MANEJAR INICIO DE ENTREVISTA ==========
  const handleEntrevistaIniciada = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const { entrevistaId, carrera, dificultad, mensajeInicial, aiDisponible } = data;
      
      console.log('🎯 Procesando entrevista iniciada:');
      console.log('  🆔 ID:', entrevistaId);
      console.log('  📚 Carrera:', carrera.nombre);
      console.log('  📊 Dificultad:', dificultad.nombre);
      console.log('  💬 Mensaje inicial:', mensajeInicial?.substring(0, 50) + '...');
      console.log('  🤖 IA disponible:', aiDisponible);
      
      // Guardar estados
      setCarreraSeleccionada(carrera);
      setDificultadSeleccionada(dificultad);
      setEntrevistaId(entrevistaId);
      
      // Crear chat inicial con mensaje de la IA
      const chatInicial = [{ 
        tipo: "ia", 
        texto: mensajeInicial || `¡Hola! Bienvenido a la entrevista de ${carrera.nombre}. Estoy aquí para ayudarte a practicar. ¿Listo para comenzar?`
      }];
      
      setChat(chatInicial);
      
      // Guardar en localStorage
      entrevistaService.guardarEntrevistaLocal(
        entrevistaId, 
        chatInicial, 
        carrera, 
        dificultad
      );
      
      // Ocultar selector
      setMostrarSelectorCarrera(false);
      setEntrevistaFinalizada(false);
      
      console.log('✅ Entrevista configurada correctamente');
      
    } catch (error) {
      console.error('❌ Error al procesar entrevista:', error);
      setError(error.message || 'Error al procesar la entrevista');
      toast.error(error.message);
      setMostrarSelectorCarrera(true);
    } finally {
      setLoading(false);
    }
  };

  // ========== ENVIAR MENSAJE ==========
  const handleEnviarMensaje = async () => {
    if (mensaje.trim() === "") {
      toast.warning('Escribe un mensaje');
      return;
    }
    
    if (!entrevistaId) {
      setError("No se ha iniciado una entrevista");
      toast.error("No se ha iniciado una entrevista");
      return;
    }
    
    if (entrevistaFinalizada) {
      setError("La entrevista ya ha finalizado");
      toast.warning("La entrevista ya ha finalizado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Agregar mensaje del usuario al chat
      const mensajeUsuario = { tipo: "usuario", texto: mensaje };
      const nuevoChat = [...chat, mensajeUsuario];
      setChat(nuevoChat);
      setMensaje("");

      console.log('📤 Enviando mensaje:', mensaje.substring(0, 50) + '...');

      // Enviar mensaje al backend
      const result = await entrevistaService.enviarMensaje(entrevistaId, mensaje);

      if (result.success) {
        const { respuesta, puedeFinalizar } = result.data;

        console.log('✅ Respuesta recibida');
        console.log('  💬 Respuesta:', respuesta?.substring(0, 50) + '...');
        console.log('  🏁 Puede finalizar:', puedeFinalizar);

        // Agregar respuesta de la IA
        if (respuesta) {
          setTimeout(() => {
            setChat(prevChat => [...prevChat, {
              tipo: "ia",
              texto: respuesta
            }]);
          }, 500);
        }

      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      setError(error.message || 'Error al enviar tu respuesta');
      toast.error(error.message);
      
      // Revertir chat en caso de error
      setChat(chat);
      setMensaje(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // ========== FINALIZAR ENTREVISTA ==========
  const finalizarEntrevista = async () => {
    if (!entrevistaId) {
      toast.error('No hay entrevista activa');
      return;
    }

    // Verificar que haya al menos 1 mensaje del usuario
    const mensajesUsuario = chat.filter(m => m.tipo === 'usuario');
    if (mensajesUsuario.length === 0) {
      toast.warning('Debes responder al menos una pregunta antes de finalizar');
      return;
    }

    const confirmar = window.confirm(
      '¿Estás seguro de que deseas finalizar la entrevista?\n\n' +
      `Has respondido ${mensajesUsuario.length} pregunta${mensajesUsuario.length !== 1 ? 's' : ''}.`
    );
    
    if (!confirmar) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏁 Finalizando entrevista:', entrevistaId);
      
      const result = await entrevistaService.finalizarEntrevista(entrevistaId);

      if (result.success) {
        const { evaluacion, estadisticas, aiDisponible } = result.data;
        
        console.log('✅ Entrevista finalizada:');
        console.log('  ⭐ Puntuación:', evaluacion.puntuacion_global);
        console.log('  📊 Nivel:', evaluacion.nivel_desempenio);
        console.log('  🤖 IA:', aiDisponible ? 'Disponible' : 'No disponible');
        
        setEntrevistaFinalizada(true);
        
        // Formatear resultados para el componente de resultados
        setResultados({
          puntuacion_general: evaluacion.puntuacion_global,
          nivel_desempenio: evaluacion.nivel_desempenio,
          fortalezas: evaluacion.fortalezas || [],
          areas_mejora: evaluacion.areas_mejora || [],
          evaluacion_detallada: evaluacion.evaluacion_detallada || {},
          recomendacion: evaluacion.recomendacion || '',
          comentario_final: evaluacion.comentario_final || '',
          proximos_pasos: evaluacion.proximos_pasos || [],
          estadisticas: estadisticas || {},
          carrera: carreraSeleccionada?.nombre || 'Carrera',
          dificultad: dificultadSeleccionada?.nombre || 'N/A',
          fecha_entrevista: new Date().toLocaleDateString('es-ES'),
          ai_disponible: aiDisponible
        });
        
        // Limpiar localStorage
        entrevistaService.limpiarEntrevistaLocal();
        
        toast.success('¡Entrevista finalizada!');

      } else {
        // Manejar error específico de mensajes insuficientes
        if (result.mensajesUsuario !== undefined) {
          toast.warning(result.error);
          return;
        }
        
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al finalizar entrevista:', error);
      setError(error.message || 'Error al finalizar la entrevista');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== ABANDONAR ENTREVISTA ==========
  const abandonarEntrevista = async () => {
    if (!entrevistaId) return;
    
    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas abandonar la entrevista?\n\n" +
      "Perderás todo el progreso actual."
    );
    
    if (!confirmacion) return;

    try {
      setLoading(true);
      
      console.log('🚪 Abandonando entrevista:', entrevistaId);
      
      const result = await entrevistaService.abandonarEntrevista(entrevistaId);

      if (result.success) {
        console.log('✅ Entrevista abandonada');
        
        // Limpiar localStorage
        entrevistaService.limpiarEntrevistaLocal();
        
        // Reiniciar estado
        setEntrevistaId(null);
        setChat([]);
        setCarreraSeleccionada(null);
        setDificultadSeleccionada(null);
        setEntrevistaFinalizada(false);
        setResultados(null);
        setMostrarSelectorCarrera(true);
        setError(null);
        
        toast.info('Entrevista abandonada');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error al abandonar entrevista:', error);
      setError(error.message || 'Error al abandonar entrevista');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== NUEVA ENTREVISTA ==========
  const handleNuevaEntrevista = () => {
    console.log('🆕 Iniciando nueva entrevista');
    
    // Limpiar localStorage
    entrevistaService.limpiarEntrevistaLocal();
    
    // Reiniciar estado
    setEntrevistaId(null);
    setChat([]);
    setCarreraSeleccionada(null);
    setDificultadSeleccionada(null);
    setEntrevistaFinalizada(false);
    setResultados(null);
    setMostrarSelectorCarrera(true);
    setError(null);
    setMensaje("");
    
    toast.info('Selecciona una carrera para comenzar');
  };

  // ========== RENDER ==========
  
  // Si la entrevista está finalizada, mostrar resultados
  if (entrevistaFinalizada && resultados) {
    return (
      <ResultadosEntrevista 
        resultados={resultados}
        onNuevaEntrevista={handleNuevaEntrevista}
      />
    );
  }

  // Si hay que mostrar el selector de carrera
  if (mostrarSelectorCarrera) {
    return (
      <AnimatePresence>
        <CarreraSelector 
          onEntrevistaIniciada={handleEntrevistaIniciada}
          onCancel={() => {
            // Si cancelan, volver al welcome
            window.location.href = '/welcome';
          }}
        />
      </AnimatePresence>
    );
  }

  // Mostrar el chat de entrevista
  return (
    <>
      <Background />
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
              {carreraSeleccionada && dificultadSeleccionada ? (
                <>
                  <strong>{carreraSeleccionada.nombre}</strong> - Nivel: <strong>{dificultadSeleccionada.nombre}</strong>
                </>
              ) : carreraSeleccionada ? (
                <>Carrera: <strong>{carreraSeleccionada.nombre}</strong></>
              ) : (
                'Practica y mejora tus habilidades de entrevista'
              )}
            </p>
          </div>
        </div>
        
        {entrevistaId && !entrevistaFinalizada && (
          <div className="entrevista-actions">
            <button 
              className="btn-secondary-small"
              onClick={finalizarEntrevista}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Finalizar
            </button>
            <button 
              className="btn-danger-small"
              onClick={abandonarEntrevista}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #ef4444',
                background: '#ef4444',
                color: 'white',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
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
            style={{
              padding: '1rem',
              margin: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#dc2626'
            }}
          >
            <AlertCircle size={18} />
            <span style={{ flex: 1 }}>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0 0.5rem'
              }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <div className="chat-main-container">
        <ChatBox 
          chat={chat}
          loading={loading}
          preguntaInicial={chat.length === 0 ? "¡Hola! Estoy aquí para ayudarte a practicar tu entrevista." : ""}
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
    </div>
    </>
  );
};

export default EntrevistaChat;