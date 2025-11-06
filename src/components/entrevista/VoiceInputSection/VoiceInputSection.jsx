// src/components/entrevista/VoiceInputSection/VoiceInputSection.jsx
// VERSIÓN MINIMALISTA - SOLO FUNCIONALIDAD
import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceInputSection = ({
  onSendMessage,
  loading,
  lastAIMessage,
  disabled
}) => {
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
    if (!transcript || !isListening) return;

    if (transcript.trim().length > 0) {
      hasSpokenRef.current = true;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // Detectar pausa de 2 segundos
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

  // ========== REPRODUCIR VOZ DE IA AUTOMÁTICAMENTE ==========
  useEffect(() => {
    if (lastAIMessage && voiceEnabled && !loading && lastAIMessage !== lastMessageRef.current) {
      lastMessageRef.current = lastAIMessage;
      console.log('🔊 Reproduciendo voz de IA...');
      speakText(lastAIMessage);
    }
  }, [lastAIMessage, voiceEnabled, loading]);

  // ========== ENVIAR MENSAJE AUTOMÁTICO ==========
  const enviarMensajeAutomatico = () => {
    if (!transcript || transcript.trim().length === 0) return;

    const textoAEnviar = transcript.trim();
    console.log('📤 Enviando:', textoAEnviar);

    // Detener reconocimiento
    SpeechRecognition.stopListening();

    // Resetear
    hasSpokenRef.current = false;

    // Enviar al backend
    onSendMessage(textoAEnviar);

    // Limpiar
    resetTranscript();

    // Reiniciar después de 500ms
    setTimeout(() => {
      if (isListening) {
        console.log('🔄 Reiniciando escucha...');
        SpeechRecognition.startListening({
          continuous: true,
          language: 'es-ES'
        });
      }
    }, 500);
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
      console.log('▶️ IA hablando...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('⏹️ IA terminó de hablar');

      // Reiniciar escucha automáticamente
      if (isListening) {
        setTimeout(() => {
          console.log('🔄 Reiniciando escucha después de IA...');
          SpeechRecognition.startListening({
            continuous: true,
            language: 'es-ES'
          });
        }, 500);
      }
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

  // ========== VALIDACIÓN ==========
  if (!browserSupportsSpeechRecognition) {
    return (
      <div>
        <p>⚠️ Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.</p>
      </div>
    );
  }

  // ========== RENDER MINIMALISTA ==========
  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px' }}>
      {/* Estado actual */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <strong>Estado:</strong> {
          loading ? '⏳ Cargando...' :
          isSpeaking ? '🔊 IA hablando...' :
          isListening ? '🎤 Escuchando...' :
          '💤 Inactivo'
        }
      </div>

      {/* Transcript */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff', border: '1px solid #ddd', minHeight: '80px' }}>
        <strong>Tu voz (transcript):</strong>
        <p>{transcript || '(vacío)'}</p>
      </div>

      {/* Controles */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={toggleListening}
          disabled={disabled || loading || isSpeaking}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            marginRight: '10px',
            cursor: (disabled || loading || isSpeaking) ? 'not-allowed' : 'pointer',
            background: isListening ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          {isListening ? '🎤 DETENER' : '🎤 INICIAR'}
        </button>

        <button
          onClick={toggleVoiceOutput}
          disabled={disabled}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: voiceEnabled ? '#3b82f6' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          {voiceEnabled ? '🔊 VOZ IA: ON' : '🔇 VOZ IA: OFF'}
        </button>
      </div>

      {/* Selector de voz */}
      <div>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Seleccionar voz:
        </label>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = availableVoices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
            console.log('🔄 Voz cambiada:', voice?.name);
          }}
          style={{
            padding: '10px',
            fontSize: '14px',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          {availableVoices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Info de debug */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', fontSize: '12px', fontFamily: 'monospace' }}>
        <strong>Debug:</strong><br />
        - Listening: {listening ? 'SÍ' : 'NO'}<br />
        - Speaking: {isSpeaking ? 'SÍ' : 'NO'}<br />
        - Voice enabled: {voiceEnabled ? 'SÍ' : 'NO'}<br />
        - Transcript length: {transcript?.length || 0}<br />
        - Has spoken: {hasSpokenRef.current ? 'SÍ' : 'NO'}<br />
        - Disabled: {disabled ? 'SÍ' : 'NO'}<br />
        - Loading: {loading ? 'SÍ' : 'NO'}
      </div>
    </div>
  );
};

export default VoiceInputSection;
