// src/components/modals/InstitutionalEmailModal/InstitutionalEmailModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Mail, ShieldAlert } from 'lucide-react';
import './InstitutionalEmailModal.css';

const InstitutionalEmailModal = ({ isOpen, onClose, attemptedEmail }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="institutional-email-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-icon-container">
                <ShieldAlert size={32} className="modal-icon" />
              </div>
              <button
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="modal-content">
              <h2 className="modal-title">Acceso Restringido</h2>
              <p className="modal-subtitle">
                Solo se permite el acceso con correos institucionales de Tecsup
              </p>

              {attemptedEmail && (
                <div className="attempted-email-box">
                  <Mail size={18} />
                  <span className="attempted-email">{attemptedEmail}</span>
                </div>
              )}

              <div className="modal-info-box">
                <AlertCircle size={20} className="info-icon" />
                <div className="info-content">
                  <h3 className="info-title">¿Por qué veo este mensaje?</h3>
                  <p className="info-text">
                    Este sistema está diseñado exclusivamente para la comunidad Tecsup.
                    Para acceder, debes usar tu correo institucional que termina en:
                  </p>
                  <div className="valid-domain-badge">
                    <Mail size={16} />
                    <strong>@tecsup.edu.pe</strong>
                  </div>
                </div>
              </div>

              <div className="modal-instructions">
                <h3 className="instructions-title">Instrucciones:</h3>
                <ol className="instructions-list">
                  <li>Cierra esta ventana</li>
                  <li>En la ventana de Google, selecciona tu cuenta institucional de Tecsup</li>
                  <li>Si no aparece, haz clic en "Usar otra cuenta" e inicia sesión con tu correo @tecsup.edu.pe</li>
                </ol>
              </div>

              <div className="modal-help">
                <p className="help-text">
                  <strong>¿No tienes un correo institucional?</strong>
                  <br />
                  Contacta con el área de TI de tu sede Tecsup para obtener tus credenciales.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button onClick={onClose} className="modal-btn-primary">
                Entendido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InstitutionalEmailModal;
