// src/pages/Auth/ResetPasswordPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import '../../styles/pages/Login.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userData, setUserData] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      toast.error('Token no proporcionado');
      setVerifying(false);
      return;
    }

    try {
      const response = await authService.verifyResetToken(token);
      if (response.valid) {
        setTokenValid(true);
        setUserData(response);
      } else {
        setTokenValid(false);
        toast.error('El enlace de recuperación es inválido o ha expirado');
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      setTokenValid(false);
      toast.error('Error al verificar el enlace de recuperación');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nuevaContrasena || !confirmarContrasena) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (nuevaContrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPassword(token, nuevaContrasena);

      if (response.success) {
        setResetSuccess(true);
        toast.success('Contraseña actualizada correctamente');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast.error(error.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Verificando token
  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-background" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader size={48} color="#2b7de9" className="spinning" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#6b7280' }}>Verificando enlace de recuperación...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-background" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={64} color="#dc2626" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
              Enlace Inválido
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              El enlace de recuperación es inválido o ha expirado.
              <br /><br />
              Los enlaces de recuperación expiran después de 1 hora por seguridad.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/forgot-password')}
                className="auth-button"
                style={{ background: '#2b7de9' }}
              >
                Solicitar Nuevo Enlace
              </button>
              <button
                onClick={() => navigate('/login')}
                className="auth-button"
                style={{ background: '#6b7280' }}
              >
                Volver al Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Contraseña restablecida exitosamente
  if (resetSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-background" />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
              Contraseña Actualizada
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              Tu contraseña ha sido actualizada correctamente.
              <br /><br />
              Serás redirigido al inicio de sesión en unos segundos...
            </p>

            <button
              onClick={() => navigate('/login')}
              className="auth-button"
              style={{ background: '#2b7de9' }}
            >
              Ir al Login Ahora
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Formulario de nueva contraseña
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
            <Lock size={24} color="#2b7de9" />
          </div>
          <h1 className="auth-title">Nueva Contraseña</h1>
          <p className="auth-subtitle">
            {userData?.nombre && `Hola ${userData.nombre}, `}
            Ingresa tu nueva contraseña para {userData?.correo}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Nueva Contraseña */}
          <div className="form-group">
            <label htmlFor="nuevaContrasena" className="form-label">
              Nueva Contraseña
            </label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                id="nuevaContrasena"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmarContrasena" className="form-label">
              Confirmar Contraseña
            </label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                id="confirmarContrasena"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Validación visual */}
          {nuevaContrasena && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: nuevaContrasena.length >= 6 ? '#10b981' : '#6b7280',
                marginBottom: '0.5rem'
              }}>
                <CheckCircle size={16} />
                <span>Al menos 6 caracteres</span>
              </div>
              {confirmarContrasena && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: nuevaContrasena === confirmarContrasena ? '#10b981' : '#dc2626'
                }}>
                  {nuevaContrasena === confirmarContrasena ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{nuevaContrasena === confirmarContrasena ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !nuevaContrasena || !confirmarContrasena || nuevaContrasena !== confirmarContrasena}
            style={{
              background: loading ? '#9ca3af' : '#2b7de9',
              cursor: (loading || !nuevaContrasena || !confirmarContrasena || nuevaContrasena !== confirmarContrasena) ? 'not-allowed' : 'pointer',
              opacity: (loading || !nuevaContrasena || !confirmarContrasena || nuevaContrasena !== confirmarContrasena) ? 0.6 : 1
            }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Actualizando...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>
      </motion.div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
