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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      minHeight: '120px'
    }}>
      {/* Sección de Transcripción - Lado Izquierdo */}
      <div style={{
        flex: 1,
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '1rem',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
          </div>
        ) : (
          <p style={{
            color: '#9ca3af',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: 0,
            textAlign: 'center'
          }}>
            {isListening ? 'Esperando tu respuesta...' : 'Presiona el micrófono para hablar'}
          </p>
        )}
      </div>

      {/* Sección Central: Animaciones Simples */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '150px'
      }}>
        {loading ? (
          <Loader size={40} className="animate-spin" style={{ color: 'white' }} />
        ) : isSpeaking ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '60px'
          }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 2, 0.8, 1.5, 1],
                  opacity: [0.6, 1, 0.7, 1, 0.6]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
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
        ) : isListening && isDetectingVoice ? (
          <div style={{
            position: 'relative',
            width: '70px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <motion.div
              animate={{
                scale: [1, 1.3],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: '70px',
                height: '70px',
                border: '2px solid white',
                borderRadius: '50%'
              }}
            />
            <Mic size={32} color="white" />
          </div>
        ) : (
          <MicOff size={40} color="rgba(255, 255, 255, 0.7)" />
        )}
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <motion.button
          onClick={toggleListening}
          disabled={disabled || loading || isSpeaking}
          whileHover={!disabled && !loading && !isSpeaking ? { scale: 1.05 } : {}}
          whileTap={!disabled && !loading && !isSpeaking ? { scale: 0.95 } : {}}
          style={{
            width: '70px',
            height: '70px',
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
          {isListening ? <Mic size={32} /> : <MicOff size={32} />}
        </motion.button>

        <motion.button
          onClick={toggleVoiceOutput}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          style={{
            width: '50px',
            height: '50px',
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
          {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </motion.button>
      </div>

      {/* Selector de voz compacto */}
      <div style={{ flex: '0 0 250px' }}>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = availableVoices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
            toast.success(`Voz cambiada`);
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.875rem',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#111827',
            cursor: 'pointer'
          }}
        >
          {availableVoices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name.substring(0, 25)}
            </option>
          ))}
        </select>
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
