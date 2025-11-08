// src/components/entrevista/VoiceInputSection/VoiceInputSection.jsx
// VERSIÓN REDISEÑADA - LAYOUT DOS COLUMNAS + DARK MODE
import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useTheme } from '../../../context/ThemeContext/ThemeContext';
import { motion } from 'framer-motion';

const VoiceInputSection = ({
  onSendMessage,
  loading,
  lastAIMessage,
  disabled
}) => {
  // ========== THEME ==========
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ========== ESTADOS ==========
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // ========== REFERENCIAS ==========
  const synthRef = useRef(window.speechSynthesis);
  const lastMessageRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const shouldResumeListeningRef = useRef(false);

  // ========== SPEECH RECOGNITION ==========
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // ========== CARGAR VOCES ==========
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      console.log('🔊 Total voces:', voices.length);

      const spanishVoices = voices.filter(voice =>
        voice.lang.includes('es') || voice.lang.includes('ES')
      );

      console.log('🇪🇸 Voces español:', spanishVoices.length);

      const voiceList = spanishVoices.length > 0 ? spanishVoices : voices;
      setAvailableVoices(voiceList);

      const femaleVoice = spanishVoices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('helena') ||
        voice.name.toLowerCase().includes('monica') ||
        voice.name.toLowerCase().includes('sabina') ||
        voice.name.toLowerCase().includes('lucia') ||
        voice.name.toLowerCase().includes('paulina')
      ) || voiceList[0];

      setSelectedVoice(femaleVoice);
      console.log('✅ Voz seleccionada:', femaleVoice?.name);
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // ========== SINCRONIZAR LISTENING ==========
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // ========== DETECCIÓN AUTOMÁTICA DE PAUSA (2 segundos) ==========
  useEffect(() => {
    // NO DETECTAR SI ESTÁ HABLANDO LA IA
    if (!transcript || !isListening || isSpeaking) return;

    if (transcript.trim().length > 0) {
      hasSpokenRef.current = true;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Detectar pausa de 2 segundos
    silenceTimerRef.current = setTimeout(() => {
      if (transcript.trim().length > 5 && hasSpokenRef.current && !isSpeaking) {
        console.log('⏸️ Pausa detectada, enviando mensaje:', transcript);
        enviarMensajeAutomatico();
      }
    }, 2000);

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [transcript, isListening, isSpeaking]);

  // ========== REPRODUCIR VOZ DE IA AUTOMÁTICAMENTE ==========
  useEffect(() => {
    if (lastAIMessage && voiceEnabled && !loading && lastAIMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastAIMessage;
      console.log('🔊 Reproduciendo voz de IA...');
      speakText(lastAIMessage);
    }
  }, [lastAIMessage, voiceEnabled, loading]);

  // ========== PAUSAR RECONOCIMIENTO MIENTRAS LOADING O SPEAKING ==========
  useEffect(() => {
    // Si está cargando o la IA está hablando, PAUSAR reconocimiento
    if ((loading || isSpeaking) && listening) {
      console.log('⏸️ PAUSANDO reconocimiento (IA procesando/hablando)');
      SpeechRecognition.stopListening();
      shouldResumeListeningRef.current = true;
    }

    // Si terminó de cargar y de hablar, y estaba escuchando antes, REANUDAR
    if (!loading && !isSpeaking && shouldResumeListeningRef.current) {
      console.log('▶️ REANUDANDO reconocimiento (IA terminó)');
      setTimeout(() => {
        SpeechRecognition.startListening({
          continuous: true,
          language: 'es-ES'
        });
        shouldResumeListeningRef.current = false;
      }, 500);
    }
  }, [loading, isSpeaking, listening]);

  // ========== ENVIAR MENSAJE AUTOMÁTICO ==========
  const enviarMensajeAutomatico = () => {
    if (!transcript || transcript.trim().length === 0) return;

    const textoAEnviar = transcript.trim();
    console.log('📤 Enviando:', textoAEnviar);

    // Detener reconocimiento INMEDIATAMENTE
    SpeechRecognition.stopListening();
    console.log('🛑 Reconocimiento detenido (enviando mensaje)');

    // Resetear
    hasSpokenRef.current = false;

    // Enviar al backend
    onSendMessage(textoAEnviar);

    // Limpiar
    resetTranscript();
  };

  // ========== INICIAR ESCUCHA ==========
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    console.log('🎤 Iniciando escucha...');
    resetTranscript();
    hasSpokenRef.current = false;
    shouldResumeListeningRef.current = false;

    SpeechRecognition.startListening({
      continuous: true,
      language: 'es-ES'
    });
  };

  // ========== DETENER ESCUCHA ==========
  const stopListening = () => {
    console.log('⏹️ Deteniendo escucha...');
    SpeechRecognition.stopListening();

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Enviar texto pendiente si existe
    if (transcript && transcript.trim().length > 0) {
      onSendMessage(transcript.trim());
      resetTranscript();
    }

    hasSpokenRef.current = false;
    shouldResumeListeningRef.current = false;
  };

  // ========== ALTERNAR ESCUCHA ==========
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ========== SÍNTESIS DE VOZ ==========
  const speakText = (text) => {
    if (!window.speechSynthesis || !voiceEnabled || !selectedVoice) {
      console.warn('⚠️ Síntesis de voz no disponible');
      return;
    }

    // Cancelar voz anterior
    synthRef.current.cancel();

    console.log('🔊 Reproduciendo:', text.substring(0, 100) + '...');
    console.log('🎙️ Voz:', selectedVoice.name);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('▶️ IA hablando... (reconocimiento PAUSADO)');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('⏹️ IA terminó de hablar (reconocimiento se REANUDARÁ)');
    };

    utterance.onerror = (event) => {
      console.error('❌ Error síntesis:', event);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // ========== ALTERNAR VOZ DE IA ==========
  const toggleVoiceOutput = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);

    if (!newState && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    console.log(newState ? '🔊 Voz IA: ON' : '🔇 Voz IA: OFF');
  };

  // ========== CLEANUP ==========
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

  // ========== COLORES DINÁMICOS ==========
  const colors = {
    bgPrimary: isDark ? '#0f172a' : '#f9fafb',
    bgSecondary: isDark ? '#1e293b' : '#ffffff',
    bgTertiary: isDark ? '#334155' : '#f3f4f6',
    headerBg: isDark ? '#0f172a' : '#1f2937',
    textPrimary: isDark ? '#f1f5f9' : '#1f2937',
    textSecondary: isDark ? '#cbd5e1' : '#6b7280',
    textMuted: isDark ? '#94a3b8' : '#9ca3af',
    border: isDark ? '#475569' : '#e5e7eb',
    accent: '#667eea',
    accentHover: '#764ba2',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb'
  };

  // ========== VALIDACIÓN ==========
  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        background: colors.bgPrimary,
        color: colors.textPrimary,
        padding: '2rem',
        textAlign: 'center',
        borderRadius: '12px',
        border: `2px solid ${colors.error}`
      }}>
        <div>
          <h3 style={{ color: colors.error, marginBottom: '1rem' }}>⚠️ Navegador no compatible</h3>
          <p>Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.</p>
        </div>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: colors.bgPrimary,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: colors.headerBg,
          borderBottom: `2px solid ${colors.border}`,
          padding: '1.5rem 2rem',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: '700',
          color: colors.textPrimary,
          textAlign: 'center',
          letterSpacing: '0.5px'
        }}>
          ENTREVISTA POR VOZ
        </h2>
        <p style={{
          margin: '0.5rem 0 0 0',
          fontSize: '0.95rem',
          color: colors.textSecondary,
          textAlign: 'center'
        }}>
          Habla con naturalidad - La IA te escucha y responde
        </p>
      </motion.div>

      {/* CONTENIDO PRINCIPAL - DOS COLUMNAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        padding: '2rem',
        flex: 1,
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* COLUMNA IZQUIERDA - ESTADO Y TRANSCRIPT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: colors.cardBg,
            borderRadius: '16px',
            padding: '2rem',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Estado Visual */}
          <div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              Estado Actual
            </h3>
            <div style={{
              background: colors.bgTertiary,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `2px solid ${
                loading ? colors.warning :
                isSpeaking ? colors.accent :
                isListening ? colors.success :
                colors.border
              }`,
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>
                {loading ? '⏳' : isSpeaking ? '🔊' : isListening ? '🎤' : '💤'}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: colors.textPrimary
              }}>
                {loading ? 'Procesando tu mensaje...' :
                 isSpeaking ? 'IA hablando (micrófono en pausa)' :
                 isListening ? 'Escuchando tu voz...' :
                 'Inactivo - Presiona INICIAR'}
              </div>
            </div>
          </div>

          {/* Transcript en tiempo real */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              Lo que estás diciendo
            </h3>
            <div style={{
              background: colors.bgTertiary,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              minHeight: '150px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {transcript && transcript.trim().length > 0 ? (
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: colors.textPrimary,
                  whiteSpace: 'pre-wrap'
                }}>
                  {transcript}
                </p>
              ) : (
                <p style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: colors.textMuted,
                  fontStyle: 'italic'
                }}>
                  {isListening ? 'Empieza a hablar...' : 'Aquí aparecerá tu texto en tiempo real'}
                </p>
              )}
              {isSpeaking && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: colors.accent + '20',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: colors.accent,
                  textAlign: 'center'
                }}>
                  🛑 Reconocimiento pausado - IA está respondiendo
                </div>
              )}
            </div>
          </div>

          {/* Controles principales */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={toggleListening}
              disabled={disabled || loading || isSpeaking}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                background: isListening
                  ? `linear-gradient(135deg, ${colors.error} 0%, #dc2626 100%)`
                  : `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`,
                border: 'none',
                borderRadius: '12px',
                cursor: disabled || loading || isSpeaking ? 'not-allowed' : 'pointer',
                opacity: disabled || loading || isSpeaking ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!disabled && !loading && !isSpeaking) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              {isListening ? '⏹️ DETENER MICRÓFONO' : '🎤 INICIAR MICRÓFONO'}
            </button>

            <button
              onClick={toggleVoiceOutput}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                background: voiceEnabled
                  ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`
                  : `linear-gradient(135deg, #6b7280 0%, #4b5563 100%)`,
                border: 'none',
                borderRadius: '12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              {voiceEnabled ? '🔊 VOZ IA: ACTIVADA' : '🔇 VOZ IA: DESACTIVADA'}
            </button>
          </div>
        </motion.div>

        {/* COLUMNA DERECHA - SELECTOR DE VOZ Y DEBUG */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            background: colors.cardBg,
            borderRadius: '16px',
            padding: '2rem',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Selector de voz */}
          <div>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              Configuración de Voz
            </h3>
            <div style={{
              background: colors.bgTertiary,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`
            }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: colors.textSecondary
              }}>
                Selecciona la voz de la IA:
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice);
                  console.log('🔄 Voz cambiada:', voice?.name);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  color: colors.textPrimary,
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {availableVoices.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              {selectedVoice && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: colors.accent + '10',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: colors.textSecondary
                }}>
                  ✓ Voz activa: <strong style={{ color: colors.accent }}>{selectedVoice.name}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Información del sistema */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.textPrimary
            }}>
              Información del Sistema
            </h3>
            <div style={{
              background: colors.bgTertiary,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              fontSize: '0.9rem',
              lineHeight: '2',
              color: colors.textSecondary
            }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Micrófono activo:</span>
                  <strong style={{ color: listening ? colors.success : colors.textMuted }}>
                    {listening ? '✓ SÍ' : '✗ NO'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IA hablando:</span>
                  <strong style={{ color: isSpeaking ? colors.warning : colors.textMuted }}>
                    {isSpeaking ? '⚠️ SÍ' : '✗ NO'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Voz habilitada:</span>
                  <strong style={{ color: voiceEnabled ? colors.accent : colors.textMuted }}>
                    {voiceEnabled ? '✓ SÍ' : '✗ NO'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Longitud transcript:</span>
                  <strong style={{ color: colors.textPrimary }}>
                    {transcript?.length || 0} caracteres
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Has hablado:</span>
                  <strong style={{ color: hasSpokenRef.current ? colors.success : colors.textMuted }}>
                    {hasSpokenRef.current ? '✓ SÍ' : '✗ NO'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estado carga:</span>
                  <strong style={{ color: loading ? colors.warning : colors.textMuted }}>
                    {loading ? '⏳ Cargando...' : '✓ Listo'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auto-reanudar:</span>
                  <strong style={{ color: shouldResumeListeningRef.current ? colors.warning : colors.textMuted }}>
                    {shouldResumeListeningRef.current ? '⏸️ SÍ' : '✗ NO'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Voces disponibles:</span>
                  <strong style={{ color: colors.accent }}>
                    {availableVoices.length}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.accentHover}15 100%)`,
            padding: '1.5rem',
            borderRadius: '12px',
            border: `1px solid ${colors.accent}40`
          }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '1rem',
              fontWeight: '600',
              color: colors.accent
            }}>
              💡 Instrucciones
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: '0.85rem',
              lineHeight: '1.8',
              color: colors.textSecondary
            }}>
              <li>Presiona <strong>INICIAR MICRÓFONO</strong> para comenzar</li>
              <li>Habla con naturalidad - El sistema detecta pausas automáticamente</li>
              <li>Después de 2 segundos de silencio, tu mensaje se enviará</li>
              <li>La IA responderá por voz (si está activada)</li>
              <li>Puedes cambiar la voz de la IA en cualquier momento</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* FOOTER (Opcional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          background: colors.headerBg,
          borderTop: `1px solid ${colors.border}`,
          padding: '1rem 2rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: colors.textMuted
        }}
      >
        <p style={{ margin: 0 }}>
          Entrevista por voz impulsada por IA • {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
};

export default VoiceInputSection;
