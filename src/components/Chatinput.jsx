import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Smile } from "lucide-react";
import PropTypes from "prop-types";

const ChatInput = ({ mensaje, setMensaje, onEnviar, disabled, loading }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [mensaje]);

  // Manejo de teclas
  const handleKeyDown = (e) => {
    // Enter sin Shift = enviar mensaje
    if (e.key === "Enter" && !e.shiftKey && !disabled && mensaje.trim() !== "") {
      e.preventDefault();
      onEnviar();
    }
    // Shift + Enter = nueva línea (comportamiento por defecto)
  };

  // Manejo del submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && mensaje.trim() !== "") {
      onEnviar();
    }
  };

  // Focus automático al montar
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="chat-input-wrapper">
      <motion.form 
        className={`chat-input-container ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Botones de acción izquierda */}
        <div className="input-actions-left">
          <motion.button
            type="button"
            className="action-button"
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            title="Adjuntar archivo"
            onClick={() => !disabled && console.log("Adjuntar archivo")}
          >
            <Paperclip size={20} />
          </motion.button>
          
          <motion.button
            type="button"
            className="action-button"
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            title="Emojis"
            onClick={() => !disabled && console.log("Abrir selector de emojis")}
          >
            <Smile size={20} />
          </motion.button>
        </div>

        {/* Input de texto (textarea autoajustable) */}
        <div className="input-field-wrapper">
          <textarea
            ref={textareaRef}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "Entrevista finalizada..." : "Escribe tu respuesta..."}
            className="input-field"
            disabled={disabled}
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none',
              overflow: 'auto'
            }}
          />
        </div>

        {/* Botones de acción derecha */}
        <div className="input-actions-right">
          {mensaje.trim() === "" ? (
            // Botón de micrófono cuando no hay texto
            <motion.button
              type="button"
              className="action-button voice"
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.1 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              title="Mensaje de voz"
              onClick={() => !disabled && console.log("Iniciar grabación de voz")}
            >
              <Mic size={20} />
            </motion.button>
          ) : (
            // Botón de enviar cuando hay texto
            <motion.button
              type="submit"
              className={`send-button ${mensaje.trim() !== "" ? 'active' : ''}`}
              disabled={disabled || loading || mensaje.trim() === ""}
              whileHover={{ scale: (disabled || loading) ? 1 : 1.05 }}
              whileTap={{ scale: (disabled || loading) ? 1 : 0.95 }}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              title="Enviar mensaje"
            >
              {loading ? (
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send size={20} />
                </motion.div>
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          )}
        </div>
      </motion.form>

      {/* Sugerencias o ayuda */}
      {!disabled && (
        <motion.div 
          className="chat-input-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          <span className="hint-text">
            Presiona <kbd>Enter</kbd> para enviar, <kbd>Shift + Enter</kbd> para nueva línea
          </span>
        </motion.div>
      )}
    </div>
  );
};

ChatInput.propTypes = {
  mensaje: PropTypes.string.isRequired,
  setMensaje: PropTypes.func.isRequired,
  onEnviar: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool
};

ChatInput.defaultProps = {
  disabled: false,
  loading: false
};

export default ChatInput;