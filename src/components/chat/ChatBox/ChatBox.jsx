import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User } from "lucide-react";
import PropTypes from "prop-types";

// Componente de puntos de carga animados
const ThinkingDots = () => (
  <motion.div
    className="thinking-dots"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="thinking-dot"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          delay: index * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </motion.div>
);

const ChatBox = forwardRef(({ chat, loading, preguntaInicial }, ref) => {
  // Variantes de animación para mensajes
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Estado vacío - mostrar pregunta inicial
  if (!chat || chat.length === 0) {
    return (
      <div className="chat-box" ref={ref}>
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-icon">
            <Bot size={48} />
          </div>
          <h3 className="empty-title">¡Listo para comenzar!</h3>
          {preguntaInicial ? (
            <div className="pregunta-inicial-card">
              <div className="avatar avatar-ia">
                <Bot size={20} />
              </div>
              <p className="pregunta-inicial-text">{preguntaInicial}</p>
            </div>
          ) : (
            <p className="empty-text">
              Escribe tu primer mensaje para iniciar la conversación
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="chat-box" ref={ref}>
      <AnimatePresence mode="sync">
        {chat.map((mensaje, index) => (
          <motion.div
            key={`mensaje-${index}`}
            className={`mensaje-wrapper ${mensaje.tipo}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {mensaje.tipo === "ia" ? (
              // Mensaje de la IA
              <div className="mensaje mensaje-ia">
                <motion.div 
                  className="avatar avatar-ia"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Bot size={20} />
                </motion.div>
                <div className="mensaje-content">
                  <div className="mensaje-bubble ia">
                    <p className="mensaje-texto">{mensaje.texto}</p>
                    <span className="mensaje-time">
                      {new Date().toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // Mensaje del usuario
              <div className="mensaje mensaje-usuario">
                <div className="mensaje-content">
                  <div className="mensaje-bubble usuario">
                    <p className="mensaje-texto">{mensaje.texto}</p>
                    <span className="mensaje-time">
                      {new Date().toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
                <motion.div 
                  className="avatar avatar-usuario"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <User size={20} />
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Indicador de carga cuando la IA está "pensando" */}
        {loading && (
          <motion.div
            className="mensaje-wrapper ia"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mensaje mensaje-ia">
              <div className="avatar avatar-ia">
                <Bot size={20} />
              </div>
              <div className="mensaje-content">
                <div className="mensaje-bubble ia loading">
                  <ThinkingDots />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ChatBox.displayName = "ChatBox";

ChatBox.propTypes = {
  chat: PropTypes.arrayOf(
    PropTypes.shape({
      tipo: PropTypes.oneOf(["ia", "usuario"]).isRequired,
      texto: PropTypes.string.isRequired
    })
  ).isRequired,
  loading: PropTypes.bool,
  preguntaInicial: PropTypes.string
};

ChatBox.defaultProps = {
  loading: false,
  preguntaInicial: ""
};

export default ChatBox;