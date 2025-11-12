// src/components/modals/InstitutionalEmailModal/InstitutionalEmailModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import './InstitutionalEmailModal.css';

const InstitutionalEmailModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="simple-error-toast"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={20} className="toast-icon" />
          <p className="toast-message">
            Correo incorrecto. Solamente dominios @tecsup.edu.pe
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstitutionalEmailModal;
