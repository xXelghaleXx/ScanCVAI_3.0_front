// src/components/entrevista/VoiceInputSection/VoiceInputSection.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';
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
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Referencias
  const synthRef = useRef(window.speechSynthesis);
  const lastMessageRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      const spanishVoices = voices.filter(voice =>
        voice.lang.includes('es') || voice.lang.includes('ES')
      );

      const voiceList = spanishVoices.length > 0 ? spanishVoices : voices;
      setAvailableVoices(voiceList);

      // Seleccionar voz femenina por defecto
      const femaleVoice = spanishVoices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('helena') ||
        voice.name.toLowerCase().includes('monica') ||
        voice.name.toLowerCase().includes('sabina') ||
        voice.name.toLowerCase().includes('lucia')
      ) || voiceList[0];

      setSelectedVoice(femaleVoice);
      console.log('🔊 Voz seleccionada:', femaleVoice?.name);
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sincronizar estado de escucha
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Detectar pausa en el habla y enviar automáticamente
  useEffect(() => {
    if (!transcript || !isListening) return;

    // Si hay texto, marcar que el usuario ha hablado
    if (transcript.trim().length > 0) {
      hasSpokenRef.current = true;
    }

    // Limpiar timer anterior
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Crear nuevo timer para detectar pausa (2 segundos de silencio)
    silenceTimerRef.current = setTimeout(() => {
      if (transcript.trim().length > 5 && hasSpokenRef.current) {
        console.log('⏸️ Pausa detectada, enviando mensaje:', transcript);
        enviarMensajeAutomatico();
      }
    }, 2000);

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, isListening]);

  // Reproducir respuesta de IA cuando llega
  useEffect(() => {
    if (lastAIMessage && voiceEnabled && !loading && lastAIMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastAIMessage;
      speakText(lastAIMessage);
    }
  }, [lastAIMessage, voiceEnabled, loading]);

  // Función para enviar mensaje automáticamente
  const enviarMensajeAutomatico = () => {
    if (!transcript || transcript.trim().length === 0) return;

    const textoAEnviar = transcript.trim();
    console.log('📤 Enviando automáticamente:', textoAEnviar);

    // Detener reconocimiento
    SpeechRecognition.stopListening();

    // Resetear flags
    hasSpokenRef.current = false;

    // Enviar mensaje
    onSendMessage(textoAEnviar);

    // Limpiar transcript
    resetTranscript();

    // Reiniciar escucha después de enviar
    setTimeout(() => {
      if (isListening) {
        SpeechRecognition.startListening({
          continuous: true,
          language: 'es-ES'
        });
      }
    }, 500);
  };

  // Iniciar escucha
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    console.log('🎤 Iniciando reconocimiento de voz...');
    resetTranscript();
    hasSpokenRef.current = false;

    SpeechRecognition.startListening({
      continuous: true,
      language: 'es-ES'
    });

    toast.info('🎤 Micrófono activado. Habla cuando estés listo.');
  };

  // Detener escucha
  const stopListening = () => {
    console.log('⏹️ Deteniendo reconocimiento de voz...');
    SpeechRecognition.stopListening();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Si hay texto pendiente, enviarlo
    if (transcript && transcript.trim().length > 0) {
      onSendMessage(transcript.trim());
      resetTranscript();
    }

    hasSpokenRef.current = false;
    toast.info('🛑 Micrófono desactivado');
  };

  // Alternar escucha
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Función para sintetizar voz
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled || !selectedVoice) {
      console.warn('⚠️ Síntesis de voz no disponible');
      return;
    }

    // Cancelar cualquier voz anterior
    synthRef.current.cancel();

    console.log('🔊 Reproduciendo respuesta de IA...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Reproducción iniciada');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('🔇 Reproducción finalizada');

      // Reiniciar escucha automáticamente después de que la IA termine de hablar
      if (isListening) {
        setTimeout(() => {
          SpeechRecognition.startListening({
            continuous: true,
            language: 'es-ES'
          });
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // Alternar síntesis de voz
  const toggleVoiceOutput = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    if (!newState && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    toast.info(newState ? 'Voz de IA activada' : 'Voz de IA desactivada');
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      SpeechRecognition.stopListening();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
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
      {/* Sección de Transcripción */}
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
          <p style={{
            color: '#111827',
            margin: 0,
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            "{transcript}"
          </p>
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

      {/* Animaciones de estado */}
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
        ) : isListening && transcript ? (
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
        {/* Botón de micrófono */}
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

        {/* Botón de control de voz */}
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

      {/* Selector de voz */}
      <div style={{ flex: '0 0 250px' }}>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = availableVoices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
            toast.success('Voz cambiada');
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

      {/* Estilos */}
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
