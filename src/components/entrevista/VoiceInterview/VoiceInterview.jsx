// src/components/entrevista/VoiceInterview/VoiceInterview.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, Settings } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-toastify';

const VoiceInterview = ({
  onSendMessage,
  loading,
  lastAIMessage,
  disabled
}) => {
  // Estados principales
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [audioSupported, setAudioSupported] = useState(true);

  // Estados de voz
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Estados de detección de audio
  const [audioLevel, setAudioLevel] = useState(0);
  const [isDetectingVoice, setIsDetectingVoice] = useState(false);

  // Referencias
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const lastMessageRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());

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

    // Cargar voces disponibles
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();

      // Filtrar voces en español y femeninas
      const spanishVoices = voices.filter(voice =>
        voice.lang.includes('es') || voice.lang.includes('ES')
      );

      setAvailableVoices(spanishVoices.length > 0 ? spanishVoices : voices);

      // Seleccionar voz femenina por defecto
      const defaultVoice = spanishVoices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('mujer') ||
        voice.name.toLowerCase().includes('helena') ||
        voice.name.toLowerCase().includes('monica') ||
        voice.name.toLowerCase().includes('sabina')
      ) || spanishVoices[0] || voices[0];

      setSelectedVoice(defaultVoice);
      console.log('🔊 Voz seleccionada:', defaultVoice?.name);
    };

    loadVoices();

    // Recargar voces cuando estén disponibles
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
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

  // Inicializar detector de audio
  const initAudioDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectSound = () => {
        if (!isListening) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcular nivel de audio
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);

        // Detectar si hay voz (umbral: 20)
        const hasVoice = average > 20;
        setIsDetectingVoice(hasVoice);

        if (hasVoice) {
          lastSpeechTimeRef.current = Date.now();

          // Limpiar timeout anterior
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
        } else {
          // Si no hay voz, iniciar countdown de silencio
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;

          if (timeSinceLastSpeech > 2000 && transcript.trim().length > 0) {
            // 2 segundos de silencio después de haber hablado
            if (!silenceTimeoutRef.current) {
              silenceTimeoutRef.current = setTimeout(() => {
                console.log('🔇 Silencio detectado, enviando...');
                stopListeningAndSend();
              }, 1000); // 1 segundo adicional de confirmación
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectSound);
      };

      detectSound();
    } catch (error) {
      console.error('Error al inicializar detección de audio:', error);
      toast.error('No se pudo acceder al micrófono');
    }
  }, [isListening, transcript]);

  // Detener detector de audio
  const stopAudioDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setAudioLevel(0);
    setIsDetectingVoice(false);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopAudioDetection();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [stopAudioDetection]);

  // Iniciar/detener detección cuando cambia isListening
  useEffect(() => {
    if (isListening) {
      initAudioDetection();
    } else {
      stopAudioDetection();
    }
  }, [isListening, initAudioDetection, stopAudioDetection]);

  // Función para iniciar grabación
  const startListening = () => {
    if (!audioSupported) {
      toast.error('Reconocimiento de voz no disponible');
      return;
    }

    resetTranscript();
    lastSpeechTimeRef.current = Date.now();

    SpeechRecognition.startListening({
      continuous: true,
      language: 'es-ES'
    });

    toast.info('🎤 Escuchando... Habla ahora');
  };

  // Función para detener grabación y enviar
  const stopListeningAndSend = () => {
    SpeechRecognition.stopListening();
    stopAudioDetection();

    if (transcript.trim()) {
      console.log('📤 Enviando transcripción:', transcript);
      onSendMessage(transcript);
      resetTranscript();
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

  // Función para sintetizar voz
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled || !selectedVoice) return;

    // Cancelar cualquier voz anterior
    synthRef.current.cancel();

    // Crear nueva utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.voice = selectedVoice;
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 0.95;
    utteranceRef.current.pitch = 1.1;
    utteranceRef.current.volume = 1.0;

    // Eventos
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Reproduciendo con voz:', selectedVoice.name);
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
        borderRadius: '16px',
        border: '2px solid #fecaca'
      }}>
        <p style={{ color: '#dc2626', margin: 0, fontSize: '1rem', fontWeight: 500 }}>
          Tu navegador no soporta entrevistas por voz. Por favor, usa Google Chrome o Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Selector de Voz */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showVoiceSelector ? '1rem' : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="#667eea" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
              Voz de la IA: {selectedVoice?.name.substring(0, 25) || 'Predeterminada'}
            </span>
          </div>
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#667eea'
            }}
          >
            {showVoiceSelector ? 'Cerrar' : 'Cambiar'}
          </button>
        </div>

        <AnimatePresence>
          {showVoiceSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '1rem',
                paddingRight: '0.5rem'
              }}>
                {availableVoices.map((voice, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceSelector(false);
                      toast.success(`Voz cambiada a: ${voice.name}`);
                    }}
                    style={{
                      padding: '0.75rem',
                      background: selectedVoice?.name === voice.name ? '#ede9fe' : '#f9fafb',
                      border: selectedVoice?.name === voice.name ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedVoice?.name !== voice.name) {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedVoice?.name !== voice.name) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                      {voice.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {voice.lang} • {voice.localService ? 'Local' : 'Red'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Área de Visualización Principal */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '2rem',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Estado y Animaciones */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              <Loader size={56} className="animate-spin" />
              <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>
                Procesando respuesta...
              </p>
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              {/* Barras de audio animadas */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '80px',
                marginBottom: '1rem'
              }}>
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [1, 2.2, 0.8, 1.8, 1.2, 1],
                      opacity: [0.6, 1, 0.7, 1, 0.8, 0.6]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.12,
                      ease: "easeInOut"
                    }}
                    style={{
                      width: '8px',
                      height: '40px',
                      background: 'white',
                      borderRadius: '4px',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                La IA está hablando...
              </p>
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              {/* Visualización de nivel de audio */}
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
                {/* Ondas solo si hay voz */}
                {isDetectingVoice && (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 2.5, 2.5],
                        opacity: [0.6, 0.3, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120px',
                        height: '120px',
                        border: '4px solid white',
                        borderRadius: '50%'
                      }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 2.5, 2.5],
                        opacity: [0.6, 0.3, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.5,
                        ease: "easeOut"
                      }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120px',
                        height: '120px',
                        border: '4px solid white',
                        borderRadius: '50%'
                      }}
                    />
                  </>
                )}

                {/* Círculo central con pulso si hay voz */}
                <motion.div
                  animate={isDetectingVoice ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                    height: '100px',
                    background: isDetectingVoice ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${isDetectingVoice ? '#ef4444' : 'white'}`
                  }}
                >
                  <Mic size={40} color="white" />
                </motion.div>
              </div>

              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                {isDetectingVoice ? '¡Te estoy escuchando!' : 'Esperando tu voz...'}
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
                (Se enviará automáticamente al terminar)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center', color: 'white' }}
            >
              <MicOff size={64} style={{ opacity: 0.7, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                Presiona el micrófono para empezar
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Botón de micrófono */}
          <motion.button
            onClick={toggleListening}
            disabled={disabled || loading || isSpeaking}
            whileHover={!disabled && !loading && !isSpeaking ? { scale: 1.05 } : {}}
            whileTap={!disabled && !loading && !isSpeaking ? { scale: 0.95 } : {}}
            style={{
              width: '90px',
              height: '90px',
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
                : '0 8px 16px rgba(0,0,0,0.2)',
              animation: isListening ? 'pulse 2s infinite' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? <Mic size={42} /> : <MicOff size={42} />}
          </motion.button>

          {/* Botón de control de voz */}
          <motion.button
            onClick={toggleVoiceOutput}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            style={{
              width: '64px',
              height: '64px',
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
            {voiceEnabled ? <Volume2 size={30} /> : <VolumeX size={30} />}
          </motion.button>
        </div>
      </div>

      {/* Transcripción en tiempo real */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'white',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#667eea', marginBottom: '0.5rem' }}>
              TU RESPUESTA:
            </div>
            <p style={{
              color: '#111827',
              margin: 0,
              fontSize: '1rem',
              lineHeight: '1.6',
              fontWeight: 500
            }}>
              "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos para la animación de pulso */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
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
