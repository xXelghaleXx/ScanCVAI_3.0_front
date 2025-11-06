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
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);

  // Referencias
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const lastMessageRef = useRef(null);

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
    if (lastAIMessage && voiceEnabled && !loading && lastAIMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastAIMessage;
      speakText(lastAIMessage);
    }
  }, [lastAIMessage, voiceEnabled, loading]);

  // Detectar silencio automáticamente (3 segundos sin hablar)
  useEffect(() => {
    if (listening && transcript.length > 0) {
      // Si el transcript cambió, resetear el timer
      if (transcript.length !== lastTranscriptLength) {
        setLastTranscriptLength(transcript.length);

        // Limpiar timer anterior
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }

        // Crear nuevo timer de 3 segundos
        const timer = setTimeout(() => {
          console.log('🔇 Silencio detectado, enviando mensaje automáticamente...');
          if (transcript.trim()) {
            stopListeningAndSend();
          }
        }, 3000); // 3 segundos de silencio

        setSilenceTimer(timer);
      }
    }

    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [transcript, listening, lastTranscriptLength]);

  // Limpiar síntesis de voz al desmontar
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, []);

  // Función para iniciar grabación
  const startListening = () => {
    if (!audioSupported) {
      toast.error('Reconocimiento de voz no disponible');
      return;
    }

    resetTranscript();
    setLastTranscriptLength(0);
    SpeechRecognition.startListening({
      continuous: true,
      language: 'es-ES'
    });
    toast.info('🎤 Escuchando... Habla ahora');
  };

  // Función para detener grabación y enviar
  const stopListeningAndSend = () => {
    SpeechRecognition.stopListening();

    // Limpiar timer de silencio
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    if (transcript.trim()) {
      console.log('📤 Enviando transcripción:', transcript);
      onSendMessage(transcript);
      resetTranscript();
      setLastTranscriptLength(0);
    } else {
      toast.warn('No se detectó ninguna voz');
    }
  };

  // Función para alternar grabación
  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSend();
    } else {
      startListening();
    }
  };

  // Función para sintetizar voz con configuración mejorada
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled) return;

    // Cancelar cualquier voz anterior
    synthRef.current.cancel();

    // Obtener voces disponibles
    const voices = synthRef.current.getVoices();

    // Buscar voz femenina en español
    const spanishFemaleVoice = voices.find(voice =>
      (voice.lang.includes('es') || voice.lang.includes('ES')) &&
      (voice.name.toLowerCase().includes('female') ||
       voice.name.toLowerCase().includes('mujer') ||
       voice.name.toLowerCase().includes('zira') ||
       voice.name.toLowerCase().includes('helena') ||
       voice.name.toLowerCase().includes('monica') ||
       voice.name.toLowerCase().includes('sabina'))
    );

    // Alternativa: buscar cualquier voz femenina
    const femaleVoice = voices.find(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('helena')
    );

    // Alternativa: buscar voz en español
    const spanishVoice = voices.find(voice =>
      voice.lang.includes('es') || voice.lang.includes('ES')
    );

    // Crear nueva utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 0.95; // Velocidad ligeramente más lenta para más naturalidad
    utteranceRef.current.pitch = 1.1; // Tono ligeramente más alto para voz femenina
    utteranceRef.current.volume = 1.0;

    // Asignar voz (prioridad a voz femenina en español)
    if (spanishFemaleVoice) {
      utteranceRef.current.voice = spanishFemaleVoice;
      console.log('🔊 Usando voz:', spanishFemaleVoice.name);
    } else if (femaleVoice) {
      utteranceRef.current.voice = femaleVoice;
      console.log('🔊 Usando voz femenina:', femaleVoice.name);
    } else if (spanishVoice) {
      utteranceRef.current.voice = spanishVoice;
      console.log('🔊 Usando voz en español:', spanishVoice.name);
    }

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
        color: 'white',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Loader size={48} className="animate-spin" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Procesando respuesta...
              </p>
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Animación de ondas de sonido */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                height: '60px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [1, 1.8, 0.8, 1.5, 1],
                      opacity: [0.5, 1, 0.7, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                    style={{
                      width: '6px',
                      height: '30px',
                      background: 'white',
                      borderRadius: '3px',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                La IA está hablando...
              </p>
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Animación de ondas concéntricas */}
              <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                <motion.div
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.5, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    border: '3px solid white',
                    borderRadius: '50%'
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 2, 2],
                    opacity: [0.5, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    border: '3px solid white',
                    borderRadius: '50%'
                  }}
                />
                <Mic size={32} style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Escuchando...
              </p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', opacity: 0.9 }}>
                (Se enviará automáticamente al terminar de hablar)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <MicOff size={48} style={{ margin: '0 auto', opacity: 0.7 }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                Toca el micrófono para hablar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcripción en tiempo real */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
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
              fontSize: '0.95rem',
              fontStyle: 'italic',
              lineHeight: '1.5'
            }}>
              <strong>Tú:</strong> "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Botón de micrófono */}
        <motion.button
          onClick={toggleListening}
          disabled={disabled || loading || isSpeaking}
          whileHover={!disabled && !loading && !isSpeaking ? { scale: 1.05 } : {}}
          whileTap={!disabled && !loading && !isSpeaking ? { scale: 0.95 } : {}}
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
            boxShadow: isListening
              ? '0 0 0 0 rgba(239, 68, 68, 0.7)'
              : '0 4px 12px rgba(0,0,0,0.2)',
            animation: isListening ? 'pulse 2s infinite' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {isListening ? <Mic size={36} /> : <MicOff size={36} />}
        </motion.button>

        {/* Botón de control de voz */}
        <motion.button
          onClick={toggleVoiceOutput}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
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
        >
          {voiceEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
        </motion.button>
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
          2. Se enviará automáticamente cuando dejes de hablar
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          3. La IA responderá con voz femenina
        </p>
      </div>

      {/* Estilos para la animación de pulso */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceInterview;
