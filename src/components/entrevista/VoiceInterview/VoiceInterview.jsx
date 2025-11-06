// src/components/entrevista/VoiceInterview/VoiceInterview.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, ChevronDown, ChevronUp, Send } from 'lucide-react';
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
  const [audioLevel, setAudioLevel] = useState(0);

  // Referencias
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const lastMessageRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Log del transcript cada vez que cambia
  useEffect(() => {
    console.log('📝 Transcript actualizado:', transcript);
    console.log('📝 Longitud:', transcript.length);
  }, [transcript]);

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
    console.log('🎤 Estado de escucha:', listening ? 'ACTIVO' : 'INACTIVO');
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
        setAudioLevel(average);

        // Detectar si hay voz (umbral: 25)
        const hasVoice = average > 25;

        if (hasVoice !== isDetectingVoice) {
          console.log('🔊 Nivel de audio:', average.toFixed(2), '- Voz detectada:', hasVoice);
        }

        setIsDetectingVoice(hasVoice);

        if (hasVoice) {
          // Hay voz detectada
          lastSpeechTimeRef.current = Date.now();
        }

        animationFrameRef.current = requestAnimationFrame(detectSound);
      };

      detectSound();
      console.log('✅ Detección de audio iniciada');
    } catch (error) {
      console.error('❌ Error al inicializar detección de audio:', error);
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  }, [isDetectingVoice]);

  // Detener detector de audio
  const stopAudioDetection = useCallback(() => {
    console.log('🛑 Deteniendo detección de audio...');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
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
    setAudioLevel(0);
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

    console.log('🎤 Iniciando escucha...');
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
    console.log('⏹️ Deteniendo escucha...');
    console.log('📝 Transcript actual:', transcript);
    console.log('📝 Longitud del transcript:', transcript.trim().length);

    SpeechRecognition.stopListening();
    stopAudioDetection();

    if (transcript.trim()) {
      console.log('📤 Enviando transcripción:', transcript);
      onSendMessage(transcript);
      toast.success('Mensaje enviado');
      resetTranscript();
    } else {
      console.warn('⚠️ No hay texto para enviar');
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

  // Función para enviar manualmente (para testing)
  const handleManualSend = () => {
    console.log('📤 Envío manual activado');
    console.log('📝 Transcript:', transcript);

    if (transcript.trim()) {
      SpeechRecognition.stopListening();
      stopAudioDetection();
      onSendMessage(transcript);
      toast.success('Mensaje enviado manualmente');
      resetTranscript();
    } else {
      toast.warn('No hay texto para enviar');
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
      height: '100vh',
      padding: '1.5rem',
      gap: '1.5rem',
      background: '#f9fafb'
    }}>
      {/* HEADER */}
      <div style={{
        background: '#1f2937',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          margin: 0,
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 700
        }}>
          ENTREVISTA POR VOZ
        </h2>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          FINALIZAR Y ABANDONAR
        </button>
      </div>

      {/* LAYOUT PRINCIPAL: 2 COLUMNAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '1.5rem',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* SECCIÓN: TEXTO DE ENTREVISTA */}
          <div style={{
            background: '#111827',
            borderRadius: '12px',
            padding: '2rem',
            flex: '0 0 280px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                TEXTO DE ENTREVISTA
              </h3>

              {/* Botón de envío manual */}
              {transcript && isListening && (
                <motion.button
                  onClick={handleManualSend}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send size={16} />
                  Enviar
                </motion.button>
              )}
            </div>

            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '1.5rem'
            }}>
              {transcript ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ width: '100%' }}
                >
                  <p style={{
                    color: '#f3f4f6',
                    margin: 0,
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    fontWeight: 400
                  }}>
                    "{transcript}"
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    Caracteres: {transcript.length} | Audio: {audioLevel.toFixed(0)}
                  </div>
                </motion.div>
              ) : (
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  margin: 0
                }}>
                  {isListening ? 'Esperando tu respuesta...' : 'Presiona el micrófono para comenzar'}
                </p>
              )}
            </div>
          </div>

          {/* SECCIÓN: OPCIONES DE ANIMACION DE VOZ Y ENVIAR AUDIO DE TEXTO */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '2.5rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            {/* Visualización según estado */}
            {loading ? (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <Loader size={56} className="animate-spin" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                  Procesando respuesta...
                </p>
              </div>
            ) : isSpeaking ? (
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
                  {isDetectingVoice ? 'Habla con claridad' : 'Empieza a hablar cuando estés listo'}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <MicOff size={72} style={{ opacity: 0.7, marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>
                  Presiona el micrófono para empezar
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem' }}>
                  Habla y luego presiona "Enviar" o el botón rojo nuevamente
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

        {/* COLUMNA DERECHA: SELECTOR DE VOCES */}
        <div style={{
          background: '#374151',
          borderRadius: '12px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              SELECTOR DE VOCES
            </h3>
            <motion.button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.4rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showVoiceSelector ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </motion.button>
          </div>

          {/* Voz actual seleccionada */}
          <div style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            marginBottom: showVoiceSelector ? '1.5rem' : 0,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginBottom: '0.5rem' }}>
              Voz Actual:
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>
              {selectedVoice?.name.substring(0, 35) || 'Predeterminada'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
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
                style={{
                  overflow: 'hidden',
                  flex: 1
                }}
              >
                <div style={{
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  paddingRight: '0.5rem'
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
                        padding: '1rem',
                        background: selectedVoice?.name === voice.name
                          ? 'rgba(139, 92, 246, 0.3)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: selectedVoice?.name === voice.name
                          ? '2px solid #8b5cf6'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: selectedVoice?.name === voice.name ? 600 : 500,
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {voice.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#d1d5db',
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
