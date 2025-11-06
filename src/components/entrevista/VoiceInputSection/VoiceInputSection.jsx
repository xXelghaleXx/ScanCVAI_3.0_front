// src/components/entrevista/VoiceInputSection/VoiceInputSection.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, Send } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-toastify';

const VoiceInputSection = ({
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
    };

    loadVoices();

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
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);

        const hasVoice = average > 25;
        setIsDetectingVoice(hasVoice);

        animationFrameRef.current = requestAnimationFrame(detectSound);
      };

      detectSound();
    } catch (error) {
      console.error('Error al inicializar detección de audio:', error);
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  }, []);

  // Detener detector de audio
  const stopAudioDetection = useCallback(() => {
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

    resetTranscript();

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
      onSendMessage(transcript);
      toast.success('Mensaje enviado');
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

  // Función para enviar manualmente
  const handleManualSend = () => {
    if (transcript.trim()) {
      SpeechRecognition.stopListening();
      stopAudioDetection();
      onSendMessage(transcript);
      toast.success('Mensaje enviado');
      resetTranscript();
    } else {
      toast.warn('No hay texto para enviar');
    }
  };

  // Función para sintetizar voz
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled || !selectedVoice) return;

    synthRef.current.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.voice = selectedVoice;
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 0.95;
    utteranceRef.current.pitch = 1.1;
    utteranceRef.current.volume = 1.0;

    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = () => setIsSpeaking(false);

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
        border: '2px solid #fecaca',
        margin: '1rem'
      }}>
        <p style={{ color: '#dc2626', margin: 0, fontSize: '1rem', fontWeight: 500 }}>
          Tu navegador no soporta entrevistas por voz. Por favor, usa Google Chrome o Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Sección de Transcripción */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '1rem',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #e5e7eb'
      }}>
        {transcript ? (
          <div style={{ width: '100%' }}>
            <p style={{
              color: '#111827',
              margin: 0,
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              "{transcript}"
            </p>
            {isListening && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Caracteres: {transcript.length}</span>
                <span>Audio: {audioLevel.toFixed(0)}</span>
              </div>
            )}
          </div>
        ) : (
          <p style={{
            color: '#9ca3af',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0
          }}>
            {isListening ? 'Esperando tu respuesta...' : 'Presiona el micrófono para hablar'}
          </p>
        )}
      </div>

      {/* Sección de Animaciones y Controles */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Visualización de Estado */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <Loader size={48} className="animate-spin" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>
              Procesando...
            </p>
          </div>
        ) : isSpeaking ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
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
                    width: '8px',
                    height: '40px',
                    background: 'white',
                    borderRadius: '4px',
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              La IA está hablando...
            </p>
          </div>
        ) : isListening ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isDetectingVoice && (
                <>
                  <motion.div
                    animate={{
                      scale: [1, 2],
                      opacity: [0.7, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    style={{
                      position: 'absolute',
                      width: '120px',
                      height: '120px',
                      border: '3px solid white',
                      borderRadius: '50%'
                    }}
                  />
                  <motion.div
                    animate={{
                      scale: [1, 2],
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
                      width: '120px',
                      height: '120px',
                      border: '3px solid white',
                      borderRadius: '50%'
                    }}
                  />
                </>
              )}

              <motion.div
                animate={isDetectingVoice ? { scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 0.8,
                  repeat: Infinity
                }}
                style={{
                  width: '100px',
                  height: '100px',
                  background: isDetectingVoice
                    ? 'rgba(239, 68, 68, 0.4)'
                    : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${isDetectingVoice ? '#ef4444' : 'white'}`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Mic size={40} color="white" />
              </motion.div>
            </div>

            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
              {isDetectingVoice ? '¡Te estoy escuchando!' : 'Esperando tu voz...'}
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.5rem' }}>
              {isDetectingVoice ? 'Habla con claridad' : 'Empieza a hablar cuando estés listo'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <MicOff size={60} style={{ opacity: 0.7, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
              Presiona el micrófono para empezar
            </p>
          </div>
        )}

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
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? <Mic size={36} /> : <MicOff size={36} />}
          </motion.button>

          {/* Botón de envío manual */}
          {transcript && isListening && (
            <motion.button
              onClick={handleManualSend}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Send size={24} />
            </motion.button>
          )}

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
                : 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {voiceEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
          </motion.button>
        </div>

        {/* Selector de voz */}
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Voz de IA:
          </label>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = availableVoices.find(v => v.name === e.target.value);
              setSelectedVoice(voice);
              toast.success(`Voz cambiada a: ${voice.name}`);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              background: 'white',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            {availableVoices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estilos para animaciones */}
      <style>{`
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

export default VoiceInputSection;
