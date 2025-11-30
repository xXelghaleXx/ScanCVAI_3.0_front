// src/components/entrevista/VoiceInterview/VoiceInterview.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, ChevronDown, ChevronUp, Send } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext/ThemeContext';
import Background from '../../layout/Background/Background';

const VoiceInterview = ({
  onSendMessage,
  loading,
  lastAIMessage,
  disabled,
  onFinalizarEntrevista,
  onAbandonarEntrevista,
  vozSeleccionada = 'alloy' // Voz de OpenAI TTS por defecto
}) => {
  // Theme
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Estados principales
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [audioSupported, setAudioSupported] = useState(true);

  // Estados de voz
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showInitialVoiceSelection, setShowInitialVoiceSelection] = useState(true);
  const [presetVoices, setPresetVoices] = useState([]);

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
  const silenceTimerRef = useRef(null);

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Log de la voz seleccionada
  useEffect(() => {
    console.log('🔊 Voz de OpenAI TTS seleccionada:', vozSeleccionada);
  }, [vozSeleccionada]);

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

      console.log('🔊 Todas las voces disponibles:', voices.map(v => ({ name: v.name, lang: v.lang })));

      // PASO 1: Filtrar voces de español LATINO (evitar España)
      const latinSpanishVoices = voices.filter(voice => {
        const nameLower = voice.name.toLowerCase();
        const langLower = voice.lang.toLowerCase();
        const isLatinAmerican = (
          langLower.includes('es-mx') || langLower.includes('es-pe') || langLower.includes('es-co') ||
          langLower.includes('es-ar') || langLower.includes('es-cl') || langLower.includes('es-ve') ||
          nameLower.includes('raul') || nameLower.includes('sabina') || nameLower.includes('jorge') || nameLower.includes('camila')
        );
        const isSpain = langLower.includes('es-es') || nameLower.includes('elena') || nameLower.includes('pablo') || nameLower.includes('alvaro');
        return isLatinAmerican && !isSpain;
      });

      // PASO 2: Filtrar solo voces NATURALES/NEURALES (no robóticas)
      const naturalVoices = latinSpanishVoices.filter(voice => {
        const nameLower = voice.name.toLowerCase();
        return nameLower.includes('neural') || nameLower.includes('natural') || nameLower.includes('online') ||
          nameLower.includes('raul') || nameLower.includes('sabina') || nameLower.includes('jorge') || nameLower.includes('camila');
      });

      console.log('🎙️ Voces naturales latinas:', naturalVoices.map(v => v.name));

      // Usar voces naturales o latinas como fallback
      let selectedVoices = naturalVoices.length > 0 ? naturalVoices : latinSpanishVoices;

      // Si no hay latinas, buscar cualquier español natural (sin España)
      if (selectedVoices.length === 0) {
        selectedVoices = voices.filter(v => {
          const n = v.name.toLowerCase(), l = v.lang.toLowerCase();
          return (l.includes('es') && !l.includes('es-es') && (n.includes('neural') || n.includes('natural')));
        });
      }

      // Último recurso: cualquier español
      if (selectedVoices.length === 0) {
        selectedVoices = voices.filter(v => v.lang.toLowerCase().includes('es')).slice(0, 4);
      }

      // Limitar a máximo 4 voces
      const finalVoices = selectedVoices.slice(0, 4);

      // Formatear las voces seleccionadas
      const foundPresets = finalVoices.map((voice, index) => {
        // Determinar si es femenina o masculina basándose en el nombre
        const nameLower = voice.name.toLowerCase();
        let gender = 'Neutral';

        if (nameLower.includes('female') || nameLower.includes('mujer') ||
          nameLower.includes('helena') || nameLower.includes('monica') ||
          nameLower.includes('sabina') || nameLower.includes('paulina')) {
          gender = 'Femenina';
        } else if (nameLower.includes('male') || nameLower.includes('hombre') ||
          nameLower.includes('pablo') || nameLower.includes('jorge') ||
          nameLower.includes('raul') || nameLower.includes('diego')) {
          gender = 'Masculina';
        }

        return {
          voice: voice,
          label: `Voz ${index + 1} (${gender})`
        };
      });

      setPresetVoices(foundPresets);
      console.log('🔊 Voces predefinidas cargadas:', foundPresets.map(p => ({
        label: p.label,
        name: p.voice.name,
        lang: p.voice.lang
      })));
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

  // Función para sintetizar voz (se define antes del useEffect)
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !voiceEnabled) {
      console.warn('⚠️ speechSynthesis no disponible o voz deshabilitada');
      return;
    }

    // Si no hay voz seleccionada, intentar obtener una voz por defecto
    let voiceToUse = selectedVoice;
    if (!voiceToUse) {
      const voices = synthRef.current.getVoices();
      const spanishVoices = voices.filter(v => v.lang.includes('es') || v.lang.includes('ES'));
      voiceToUse = spanishVoices[0] || voices[0];
      console.warn('⚠️ No había voz seleccionada, usando voz por defecto:', voiceToUse?.name);

      if (!voiceToUse) {
        console.error('❌ No hay voces disponibles en el sistema');
        return;
      }

      // Actualizar selectedVoice para futuros usos
      setSelectedVoice(voiceToUse);
    }

    // Cancelar cualquier voz anterior
    synthRef.current.cancel();

    // Crear nueva utterance
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.voice = voiceToUse;
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 0.95;
    utteranceRef.current.pitch = 1.1;
    utteranceRef.current.volume = 1.0;

    // Eventos
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Reproduciendo con voz:', voiceToUse.name);
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      console.log('🔇 Reproducción finalizada');
    };

    utteranceRef.current.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      setIsSpeaking(false);
      toast.error('Error al reproducir la voz de la IA');
    };

    // Reproducir
    console.log('🎙️ Iniciando síntesis de voz...');
    synthRef.current.speak(utteranceRef.current);
  }, [voiceEnabled, selectedVoice]);

  // Reproducir respuesta de IA cuando llega un nuevo mensaje
  useEffect(() => {
    if (lastAIMessage && voiceEnabled && !loading && lastAIMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastAIMessage;
      console.log('🔊 Intentando reproducir voz de IA...');
      speakText(lastAIMessage);

      // Detectar si la IA ha finalizado la entrevista
      const frasesFin = [
        'entrevista ha concluido',
        'hemos terminado',
        'finalizado la entrevista',
        'muchas gracias por tu tiempo',
        'fin de la entrevista',
        'entrevista finalizada',
        'eso es todo por hoy',
        'ha sido un placer',
        'termina aquí'
      ];

      const entrevistaFinalizadaPorIA = frasesFin.some(frase =>
        lastAIMessage.toLowerCase().includes(frase)
      );

      if (entrevistaFinalizadaPorIA && onFinalizarEntrevista) {
        console.log('🏁 IA ha finalizado la entrevista automáticamente en modo voz');
        toast.success('La entrevista ha finalizado. Generando resultados...');

        // Ejecutar finalización después de que termine de hablar
        setTimeout(() => {
          onFinalizarEntrevista();
        }, 2000);
      }
    } else if (lastAIMessage && voiceEnabled && !loading && !selectedVoice) {
      console.warn('⚠️ No hay voz seleccionada todavía, esperando...');
    }
  }, [lastAIMessage, voiceEnabled, loading, selectedVoice, speakText, onFinalizarEntrevista]);

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

      // @ts-ignore
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

        setIsDetectingVoice(hasVoice);

        if (hasVoice) {
          // Hay voz detectada - reiniciar timer de silencio
          lastSpeechTimeRef.current = Date.now();

          // Cancelar timer anterior si existe
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // No hay voz - verificar si han pasado 3.5 segundos de silencio
          const silenceDuration = Date.now() - lastSpeechTimeRef.current;

          if (silenceDuration >= 3500 && !silenceTimerRef.current) {
            // Iniciar timer para auto-enviar
            silenceTimerRef.current = setTimeout(() => {
              console.log('⏱️ Auto-enviando por 3.5 segundos de silencio');
              if (transcript.trim()) {
                stopListeningAndSend();
              }
              silenceTimerRef.current = null;
            }, 100); // Small delay to ensure state is updated
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
  }, []);

  // Detener detector de audio
  const stopAudioDetection = useCallback(() => {
    console.log('🛑 Deteniendo detección de audio...');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
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

  // Colores dinámicos basados en el tema
  const colors = {
    bgSecondary: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    bgTertiary: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(243, 244, 246, 0.8)',
    headerBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(31, 41, 55, 0.95)',
    textPrimary: isDark ? '#f1f5f9' : '#1f2937',
    textSecondary: isDark ? '#cbd5e1' : '#6b7280',
    border: isDark ? '#475569' : '#e5e7eb',
    accent: '#667eea',
    accentHover: '#764ba2',
    error: '#ef4444'
  };

  return (
    <>
      <Background />

      {/* MODAL DE SELECCIÓN INICIAL DE VOZ */}
      {showInitialVoiceSelection && presetVoices.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: colors.bgSecondary,
              borderRadius: '20px',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              maxWidth: '600px',
              width: '100%',
              border: `2px solid ${colors.border}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h2 style={{
              margin: '0 0 1rem 0',
              color: colors.textPrimary,
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 700,
              textAlign: 'center'
            }}>
              Selecciona una Voz para la Entrevista
            </h2>
            <p style={{
              margin: '0 0 2rem 0',
              color: colors.textSecondary,
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              textAlign: 'center'
            }}>
              Elige la voz que prefieras para las respuestas de la IA
            </p>

            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'
            }}>
              {presetVoices.map((preset, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedVoice(preset.voice);
                    setShowInitialVoiceSelection(false);
                    toast.success(`Voz seleccionada: ${preset.label}`);
                    console.log('🔊 Voz elegida:', preset.voice.name);
                  }}
                  style={{
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <Volume2 size={28} style={{ marginBottom: '0.5rem' }} />
                  <div>{preset.label}</div>
                  <div style={{
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    opacity: 0.8,
                    marginTop: '0.25rem'
                  }}>
                    {preset.voice.name.substring(0, 30)}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: 'clamp(0.75rem, 2vw, 1.5rem)',
        gap: 'clamp(0.75rem, 2vw, 1.5rem)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* HEADER */}
        <div style={{
          background: colors.headerBg,
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(8px, 2vw, 12px)',
          padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${colors.border}`,
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <h2 style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 700
          }}>
            ENTREVISTA POR VOZ
          </h2>

          {/* Botones de Finalizar y Abandonar */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <button
              onClick={onFinalizarEntrevista}
              disabled={disabled || loading}
              style={{
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                background: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                fontWeight: 600,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                opacity: disabled || loading ? 0.5 : 1
              }}
            >
              Finalizar
            </button>
            <button
              onClick={onAbandonarEntrevista}
              disabled={disabled || loading}
              style={{
                padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                background: colors.error,
                color: 'white',
                border: `2px solid ${colors.error}`,
                borderRadius: '8px',
                fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                fontWeight: 600,
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                opacity: disabled || loading ? 0.5 : 1
              }}
            >
              Abandonar
            </button>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          flex: 1
        }}>
          {/* SECCIÓN: TEXTO DE ENTREVISTA */}
          <div style={{
            background: colors.bgSecondary,
            backdropFilter: 'blur(10px)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            padding: 'clamp(1rem, 3vw, 2rem)',
            flex: '0 0 auto',
            minHeight: 'clamp(200px, 30vh, 280px)',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: 700,
                color: colors.textPrimary,
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
              background: colors.bgTertiary,
              borderRadius: '8px',
              padding: '1.5rem',
              border: `1px solid ${colors.border}`
            }}>
              {transcript ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ width: '100%' }}
                >
                  <p style={{
                    color: colors.textPrimary,
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
                    color: colors.textSecondary
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
    </>
  );
};

export default VoiceInterview;
