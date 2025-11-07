// src/components/entrevista/VoiceInputSection/VoiceInputSection.jsx
// VERSIÓN MINIMALISTA - SOLO FUNCIONALIDAD + FIX BUCLE
import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import '../../../styles/layout/VoiceInputSection.css';

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

  // ========== VALIDACIÓN ==========
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-unsupported">
        <p>⚠️ Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.</p>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div className="voice-input-container">
      {/* Estado actual */}
      <div className="voice-status">
        <strong>Estado:</strong> {
          loading ? '⏳ Cargando...' :
          isSpeaking ? '🔊 IA hablando... (mic PAUSADO)' :
          isListening ? '🎤 Escuchando...' :
          '💤 Inactivo'
        }
      </div>

      {/* Transcript */}
      <div className="voice-transcript">
        <strong>Tu voz (transcript):</strong>
        <p>{transcript || '(vacío)'}</p>
        {isSpeaking && (
          <p className="voice-transcript-paused">
            🛑 Reconocimiento pausado - IA hablando
          </p>
        )}
      </div>

      {/* Controles */}
      <div className="voice-controls">
        <button
          onClick={toggleListening}
          disabled={disabled || loading || isSpeaking}
          className={`voice-btn ${isListening ? 'voice-btn-stop' : 'voice-btn-start'}`}
        >
          {isListening ? '🎤 DETENER' : '🎤 INICIAR'}
        </button>

        <button
          onClick={toggleVoiceOutput}
          disabled={disabled}
          className={`voice-btn ${voiceEnabled ? 'voice-btn-voice-on' : 'voice-btn-voice-off'}`}
        >
          {voiceEnabled ? '🔊 VOZ IA: ON' : '🔇 VOZ IA: OFF'}
        </button>
      </div>

      {/* Selector de voz */}
      <div className="voice-selector-container">
        <label className="voice-selector-label">
          Seleccionar voz:
        </label>
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const voice = availableVoices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
            console.log('🔄 Voz cambiada:', voice?.name);
          }}
          className="voice-selector"
        >
          {availableVoices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Info de debug */}
      <div className="voice-debug">
        <strong>Debug:</strong><br />
        - Listening: {listening ? 'SÍ' : 'NO'}<br />
        - Speaking: {isSpeaking ? 'SÍ ⚠️' : 'NO'}<br />
        - Voice enabled: {voiceEnabled ? 'SÍ' : 'NO'}<br />
        - Transcript length: {transcript?.length || 0}<br />
        - Has spoken: {hasSpokenRef.current ? 'SÍ' : 'NO'}<br />
        - Disabled: {disabled ? 'SÍ' : 'NO'}<br />
        - Loading: {loading ? 'SÍ' : 'NO'}<br />
        - Should resume: {shouldResumeListeningRef.current ? 'SÍ ⏸️' : 'NO'}
      </div>
    </div>
  );
};

export default VoiceInputSection;
