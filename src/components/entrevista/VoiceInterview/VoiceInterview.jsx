// src/components/entrevista/VoiceInterview/VoiceInterview.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, Settings, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isDetectingVoice, setIsDetectingVoice] = useState(false);

  // Referencias
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const lastMessageRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const sendTimeoutRef = useRef(null);

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

      // Filtrar voces en español
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
      console.log('🎤 Iniciando detección de audio...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectSound = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcular nivel de audio promedio
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

        // Detectar si hay voz (umbral: 25)
        const hasVoice = average > 25;
        setIsDetectingVoice(hasVoice);

        if (hasVoice) {
          // Hay voz detectada
          lastSpeechTimeRef.current = Date.now();

          // Limpiar timeout si existía
          if (sendTimeoutRef.current) {
            clearTimeout(sendTimeoutRef.current);
            sendTimeoutRef.current = null;
          }
        } else {
          // No hay voz, verificar si debe enviar
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;

          // Si han pasado 2.5 segundos de silencio y hay texto
          if (timeSinceLastSpeech > 2500 && transcript.trim().length > 0 && !sendTimeoutRef.current) {
            console.log('🔇 Silencio detectado, programando envío...');
            sendTimeoutRef.current = setTimeout(() => {
              console.log('📤 Enviando mensaje automáticamente');
              stopListeningAndSend();
            }, 500); // 500ms adicionales de confirmación
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectSound);
      };

      detectSound();
      console.log('✅ Detección de audio iniciada');
    } catch (error) {
      console.error('❌ Error al inicializar detección de audio:', error);
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  }, [transcript]);

  // Detener detector de audio
  const stopAudioDetection = useCallback(() => {
    console.log('🛑 Deteniendo detección de audio...');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    analyserRef.current = null;
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
    console.log('⏹️ Deteniendo escucha y enviando...');
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
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: '1.5rem',
      marginTop: '1.5rem'
    }}>
      {/* Columna Principal (Izquierda) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Sección: Texto de Entrevista */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#667eea',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Transcripción en Tiempo Real
          </h3>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {transcript ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  width: '100%'
                }}
              >
                <p style={{
                  color: '#111827',
                  margin: 0,
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  fontWeight: 500
                }}>
                  "{transcript}"
                </p>
              </motion.div>
            ) : (
              <p style={{
                color: '#9ca3af',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                margin: 0
              }}>
                {isListening ? 'Esperando tu respuesta...' : 'Presiona el micrófono para comenzar'}
              </p>
            )}
          </div>
        </div>

        {/* Sección: Opciones de Animación y Controles */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '2.5rem',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          position: 'relative'
        }}>
          {/* Visualización según estado */}
          {loading ? (
            // Estado: Cargando
            <div style={{ textAlign: 'center', color: 'white' }}>
              <Loader size={56} className="animate-spin" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                Procesando respuesta...
              </p>
            </div>
          ) : isSpeaking ? (
            // Estado: IA hablando
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '100px',
                marginBottom: '1.5rem'
              }}>
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [1, 2.5, 0.8, 2, 1.2, 1],
                      opacity: [0.6, 1, 0.7, 1, 0.8, 0.6]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    style={{
                      width: '10px',
                      height: '50px',
                      background: 'white',
                      borderRadius: '5px',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                La IA está hablando...
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
                Escucha la respuesta
              </p>
            </div>
          ) : isListening ? (
            // Estado: Escuchando
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{
                position: 'relative',
                width: '150px',
                height: '150px',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Ondas concéntricas - solo si hay voz */}
                {isDetectingVoice && (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 2.2],
                        opacity: [0.7, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                      style={{
                        position: 'absolute',
                        width: '150px',
                        height: '150px',
                        border: '4px solid white',
                        borderRadius: '50%'
                      }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 2.2],
                        opacity: [0.7, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.5,
                        ease: "easeOut"
                      }}
                      style={{
                        position: 'absolute',
                        width: '150px',
                        height: '150px',
                        border: '4px solid white',
                        borderRadius: '50%'
                      }}
                    />
                  </>
                )}

                {/* Círculo central */}
                <motion.div
                  animate={isDetectingVoice ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                  }}
                  style={{
                    width: '120px',
                    height: '120px',
                    background: isDetectingVoice
                      ? 'rgba(239, 68, 68, 0.4)'
                      : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${isDetectingVoice ? '#ef4444' : 'white'}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <Mic size={48} color="white" />
                </motion.div>
              </div>

              <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>
                {isDetectingVoice ? '¡Te estoy escuchando!' : 'Esperando tu voz...'}
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
                {isDetectingVoice
                  ? 'Habla con claridad'
                  : 'Empieza a hablar cuando estés listo'}
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
                (Se enviará automáticamente al terminar)
              </p>
            </div>
          ) : (
            // Estado: Listo para iniciar
            <div style={{ textAlign: 'center', color: 'white' }}>
              <MicOff size={72} style={{ opacity: 0.7, marginBottom: '1.5rem' }} />
              <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>
                Presiona el micrófono para empezar
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
                Tu respuesta será grabada y enviada automáticamente
              </p>
            </div>
          )}

          {/* Controles */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            marginTop: '1rem'
          }}>
            {/* Botón de micrófono */}
            <motion.button
              onClick={toggleListening}
              disabled={disabled || loading || isSpeaking}
              whileHover={!disabled && !loading && !isSpeaking ? { scale: 1.05 } : {}}
              whileTap={!disabled && !loading && !isSpeaking ? { scale: 0.95 } : {}}
              style={{
                width: '100px',
                height: '100px',
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
              {isListening ? <Mic size={48} /> : <MicOff size={48} />}
            </motion.button>

            {/* Botón de control de voz */}
            <motion.button
              onClick={toggleVoiceOutput}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: 'none',
                background: voiceEnabled
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {voiceEnabled ? <Volume2 size={32} /> : <VolumeX size={32} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Selector de Voces */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        height: 'fit-content',
        position: 'sticky',
        top: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} color="#667eea" />
            <h3 style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#374151',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Selector de Voces
            </h3>
          </div>
          <motion.button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.4rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showVoiceSelector ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </motion.button>
        </div>

        {/* Voz actual seleccionada */}
        <div style={{
          padding: '1rem',
          background: '#f3f4f6',
          borderRadius: '8px',
          marginBottom: showVoiceSelector ? '1rem' : 0
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Voz Actual:
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
            {selectedVoice?.name.substring(0, 35) || 'Predeterminada'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {selectedVoice?.lang}
          </div>
        </div>

        {/* Lista de voces */}
        <AnimatePresence>
          {showVoiceSelector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingRight: '0.25rem'
              }}>
                {availableVoices.map((voice, index) => (
                  <motion.div
                    key={index}
                    onClick={() => {
                      setSelectedVoice(voice);
                      toast.success(`Voz cambiada a: ${voice.name}`);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '0.75rem',
                      background: selectedVoice?.name === voice.name ? '#ede9fe' : '#f9fafb',
                      border: selectedVoice?.name === voice.name ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: selectedVoice?.name === voice.name ? 600 : 500,
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {voice.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{voice.lang}</span>
                      <span>•</span>
                      <span>{voice.localService ? '📍 Local' : '🌐 Red'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 25px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceInterview;
