// src/components/Entrevista.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  TrendingUp,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from 'react-toastify';
import ChatBox from "./Chatbox";
import ChatInput from "./Chatinput";
import CarreraSelector from "./CarreraSelector";
import ResultadosEntrevista from "./ResultadosEntrevista";
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

  const verificarEntrevistaExistente = () => {
    console.log('🔍 Verificando si hay entrevista guardada...');
    
    const entrevistaGuardada = entrevistaService.recuperarEntrevistaLocal();
    const carreraGuardada = localStorage.getItem('carreraSeleccionada');
    const dificultadGuardada = localStorage.getItem('dificultadSeleccionada');
    
    if (entrevistaGuardada.success && carreraGuardada) {
      const { id, chatHistory } = entrevistaGuardada.data;
      const carrera = JSON.parse(carreraGuardada);
      const dificultad = dificultadGuardada ? JSON.parse(dificultadGuardada) : null;
      
      setEntrevistaId(id);
      setChat(chatHistory || []);
      setCarreraSeleccionada(carrera);
      setDificultadSeleccionada(dificultad);
      setMostrarSelectorCarrera(false);
      
      console.log('✅ Entrevista recuperada:', id);
      console.log('✅ Carrera recuperada:', carrera.nombre);
      if (dificultad) {
        console.log('✅ Dificultad recuperada:', dificultad.nombre);
      }
    } else {
      console.log('📝 No hay entrevista guardada, mostrando selector de carrera...');
      setMostrarSelectorCarrera(true);
    }
  };

  // ========== GUARDAR ESTADO AUTOMÁTICAMENTE ==========
  useEffect(() => {
    if (entrevistaId && chat.length > 0 && !entrevistaFinalizada) {
      entrevistaService.guardarEntrevistaLocal(entrevistaId, chat);
      if (carreraSeleccionada) {
        localStorage.setItem('carreraSeleccionada', JSON.stringify(carreraSeleccionada));
      }
      if (dificultadSeleccionada) {
        localStorage.setItem('dificultadSeleccionada', JSON.stringify(dificultadSeleccionada));
      }
    }
  }, [entrevistaId, chat, entrevistaFinalizada, carreraSeleccionada, dificultadSeleccionada]);

  // ========== MANEJAR INICIO DE ENTREVISTA (CON CARRERA Y DIFICULTAD) ==========
  const handleEntrevistaIniciada = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const { entrevista, carrera, dificultad } = data;
      
      console.log('🎯 Entrevista iniciada desde CarreraSelector');
      console.log('📚 Carrera:', carrera.nombre);
      console.log('📊 Dificultad:', dificultad.nombre);
      console.log('🆔 Entrevista ID:', entrevista.entrevista_id || entrevista.id);
      console.log('💬 Mensaje inicial:', entrevista.mensaje);
      
      // Guardar estados
      setCarreraSeleccionada(carrera);
      setDificultadSeleccionada(dificultad);
      
      // El ID puede venir como entrevista_id o id dependiendo del backend
      const idEntrevista = entrevista.entrevista_id || entrevista.id;
      setEntrevistaId(idEntrevista);
      
      // Establecer el mensaje inicial de la IA
      const mensajeInicial = entrevista.mensaje || 
        `¡Hola! Bienvenido a la entrevista de ${carrera.nombre} en nivel ${dificultad.nombre}. Estoy aquí para ayudarte a practicar. ¿Listo para comenzar?`;
      
      setChat([{ 
        tipo: "ia", 
        texto: mensajeInicial
      }]);
      
      // Guardar en localStorage
      entrevistaService.guardarEntrevistaLocal(idEntrevista, [{
        tipo: "ia",
        texto: mensajeInicial
      }]);
      localStorage.setItem('carreraSeleccionada', JSON.stringify(carrera));
      localStorage.setItem('dificultadSeleccionada', JSON.stringify(dificultad));
      
      // Ocultar selector y mostrar chat
      setMostrarSelectorCarrera(false);
      setEntrevistaFinalizada(false);
      
      toast.success(`Entrevista iniciada: ${carrera.nombre} - ${dificultad.nombre}`);
      
    } catch (error) {
      console.error('❌ Error al procesar entrevista iniciada:', error);
      setError(error.message || 'Error al procesar la entrevista');
      toast.error(error.message);
      
      // Mantener el selector visible en caso de error
      setMostrarSelectorCarrera(true);
    } finally {
      setLoading(false);
    }
  };

  // ========== ENVIAR MENSAJE ==========
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

      const mensajeUsuario = { tipo: "usuario", texto: mensaje };
      setChat(prevChat => [...prevChat, mensajeUsuario]);
      setMensaje("");

      console.log('📤 Enviando mensaje:', mensaje);

      const result = await entrevistaService.enviarMensaje(entrevistaId, mensaje);

      if (result.success) {
        const { respuesta, finalizada } = result.data;

        if (respuesta) {
          setTimeout(() => {
            setChat(prevChat => [...prevChat, {
              tipo: "ia",
              texto: respuesta
            }]);
          }, 500);
        }

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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FINALIZAR ENTREVISTA ==========
  const finalizarEntrevista = async () => {
    if (!entrevistaId) return;

    try {
      setLoading(true);
      
      console.log('🏁 Finalizando entrevista...');
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/api/entrevistas/${entrevistaId}/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al finalizar entrevista');
      }

      const data = await response.json();
      console.log('✅ Entrevista finalizada:', data);
      
      setEntrevistaFinalizada(true);
      setResultados(data.resultados);
      
      // Limpiar localStorage
      entrevistaService.limpiarEntrevistaLocal();
      localStorage.removeItem('carreraSeleccionada');
      localStorage.removeItem('dificultadSeleccionada');
      
      toast.success('¡Entrevista finalizada!');

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
    
    const confirmacion = window.confirm("¿Estás seguro de que deseas abandonar la entrevista?");
    if (!confirmacion) return;

    try {
      setLoading(true);
      
      console.log('🚪 Abandonando entrevista...');
      
      const result = await entrevistaService.abandonarEntrevista(entrevistaId);

      if (result.success) {
        entrevistaService.limpiarEntrevistaLocal();
        localStorage.removeItem('carreraSeleccionada');
        localStorage.removeItem('dificultadSeleccionada');
        
        // Reiniciar estado
        setEntrevistaId(null);
        setChat([]);
        setCarreraSeleccionada(null);
        setDificultadSeleccionada(null);
        setEntrevistaFinalizada(false);
        setResultados(null);
        setMostrarSelectorCarrera(true);
        
        toast.info('Entrevista abandonada');
        console.log('✅ Entrevista abandonada');
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
    // Limpiar todo
    entrevistaService.limpiarEntrevistaLocal();
    localStorage.removeItem('carreraSeleccionada');
    localStorage.removeItem('dificultadSeleccionada');
    
    setEntrevistaId(null);
    setChat([]);
    setCarreraSeleccionada(null);
    setDificultadSeleccionada(null);
    setEntrevistaFinalizada(false);
    setResultados(null);
    setMostrarSelectorCarrera(true);
    setError(null);
    
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
          onCancel={null}
        />
      </AnimatePresence>
    );
  }

  // Mostrar el chat de entrevista
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
  );
};

export default EntrevistaChat;