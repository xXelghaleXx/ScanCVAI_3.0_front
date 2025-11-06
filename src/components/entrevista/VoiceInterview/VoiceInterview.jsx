// src/components/entrevista/VoiceInterview/VoiceInterview.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-toastify';

const VoiceInterview = ({
  onSendMessage,
  loading,
  lastAIMessage,
  disabled
}) => {
  // Estados
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [audioSupported, setAudioSupported] = useState(true);

  // Referencia para el sintetizador de voz
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Verificar soporte del navegador
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setAudioSupported(false);
      toast.error('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
    }

    if (!window.speechSynthesis) {
      setAudioSupported(false);
      toast.error('Tu navegador no soporta síntesis de voz.');
    }
  }, [browserSupportsSpeechRecognition]);

  // Sincronizar estado de escucha
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Reproducir respuesta de IA cuando llega un nuevo mensaje
  useEffect(() => {
    if (lastAIMessage && voiceEnabled && !loading) {
      speakText(lastAIMessage);
    }
  }, [lastAIMessage, voiceEnabled, loading]);

  // Limpiar síntesis de voz al desmontar
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Función para iniciar/detener grabación
  const toggleListening = () => {
    if (!audioSupported) {
      toast.error('Reconocimiento de voz no disponible');
      return;
    }

    if (isListening) {
      // Detener grabación y enviar
      SpeechRecognition.stopListening();

      if (transcript.trim()) {
        console.log('📤 Enviando transcripción:', transcript);
        onSendMessage(transcript);
        resetTranscript();
      } else {
        toast.warn('No se detectó ninguna voz');
      }
    } else {
      // Iniciar grabación
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: 'es-ES'
      });
      toast.info('Escuchando... Habla ahora');
    }
  };

  // Función para sintetizar voz
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled) return;

    // Cancelar cualquier voz anterior
    synthRef.current.cancel();

    // Crear nueva utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 1.0;
    utteranceRef.current.pitch = 1.0;
    utteranceRef.current.volume = 1.0;

    // Eventos
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Reproduciendo respuesta de IA');
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      console.log('🔇 Reproducción finalizada');
    };

    utteranceRef.current.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      setIsSpeaking(false);
    };

    // Reproducir
    synthRef.current.speak(utteranceRef.current);
  };

  // Función para detener la voz
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Función para alternar síntesis de voz
  const toggleVoiceOutput = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    if (!newState) {
      stopSpeaking();
      toast.info('Respuestas de voz desactivadas');
    } else {
      toast.success('Respuestas de voz activadas');
    }
  };

  if (!audioSupported) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <p style={{ color: '#dc2626', margin: 0 }}>
          Tu navegador no soporta entrevistas por voz. Por favor, usa Google Chrome o Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }}>
      {/* Visualización de estado */}
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader size={48} className="animate-spin" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Procesando respuesta...
              </p>
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              key="speaking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Volume2 size={48} style={{ margin: '0 auto', animation: 'pulse 1.5s infinite' }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                La IA está hablando...
              </p>
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Mic size={48} style={{ margin: '0 auto', animation: 'pulse 1s infinite' }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Escuchando...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MicOff size={48} style={{ margin: '0 auto', opacity: 0.7 }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Presiona el micrófono para hablar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcripción en tiempo real */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '1rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <p style={{
            color: 'white',
            margin: 0,
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            "{transcript}"
          </p>
        </motion.div>
      )}

      {/* Controles */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Botón de micrófono */}
        <button
          onClick={toggleListening}
          disabled={disabled || loading || isSpeaking}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'white',
            color: isListening ? 'white' : '#667eea',
            cursor: (disabled || loading || isSpeaking) ? 'not-allowed' : 'pointer',
            opacity: (disabled || loading || isSpeaking) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            transform: isListening ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (!disabled && !loading && !isSpeaking) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = isListening ? 'scale(1.1)' : 'scale(1)';
          }}
        >
          {isListening ? <Mic size={36} /> : <MicOff size={36} />}
        </button>

        {/* Botón de control de voz */}
        <button
          onClick={toggleVoiceOutput}
          disabled={disabled}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: voiceEnabled
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = voiceEnabled
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.1)';
          }}
        >
          {voiceEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
        </button>
      </div>

      {/* Instrucciones */}
      <div style={{
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.875rem'
      }}>
        <p style={{ margin: '0.5rem 0' }}>
          1. Presiona el micrófono y habla tu respuesta
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          2. Presiona nuevamente para enviar
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          3. La IA responderá con voz
        </p>
      </div>
    </div>
  );
};

export default VoiceInterview;
