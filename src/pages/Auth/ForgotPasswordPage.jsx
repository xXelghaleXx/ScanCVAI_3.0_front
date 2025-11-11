// src/pages/Auth/ForgotPasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import '../../styles/pages/Auth.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(correo);

      if (response.success) {
        setEmailSent(true);
        toast.success('Si el correo existe, recibirás un enlace de recuperación');
      }
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-background" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
              Correo Enviado
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              Si tu correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
              <br /><br />
              Por favor revisa tu bandeja de entrada y también la carpeta de spam.
              <br /><br />
              El enlace expirará en <strong>1 hora</strong>.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                className="auth-button"
                style={{ background: '#2b7de9' }}
              >
                Volver al Login
              </button>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setCorreo('');
                }}
                className="auth-button"
                style={{ background: '#6b7280' }}
              >
                Enviar Otro Correo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="auth-header">
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Mail size={24} color="#2b7de9" />
          </div>
          <h1 className="auth-title">Recuperar Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                id="correo"
                type="email"
                className="form-input"
                placeholder="tu-correo@tecsup.edu.pe"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Info */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} color="#2b7de9" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
              <strong>Nota:</strong> El enlace de recuperación expirará en 1 hora. Si no recibes el correo, revisa tu carpeta de spam.
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#2b7de9',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Enviando...
              </>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </button>
        </form>

        {/* Volver */}
        <div className="auth-footer">
          <button
            onClick={() => navigate('/login')}
            className="auth-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '0.875rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#2b7de9'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            <ArrowLeft size={16} />
            Volver al inicio de sesión
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
