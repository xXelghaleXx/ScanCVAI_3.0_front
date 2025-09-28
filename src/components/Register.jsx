import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import '../styles/Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    carrera: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // ========== MANEJO DE FORMULARIO ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ========== VALIDACIONES ==========
  const validateForm = () => {
    const { nombre, apellido, email, password, confirmPassword } = formData;

    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, ingresa un email válido');
      return false;
    }

    // Validar que sea email de TECSUP (opcional, ajusta según tus necesidades)
    if (!email.toLowerCase().endsWith('@tecsup.edu.pe')) {
      toast.warning('Se recomienda usar tu email institucional @tecsup.edu.pe');
    }

    // Validar contraseña
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  // ========== REGISTRO ==========
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Intentando registro...');
      
      // Preparar datos para enviar
      const registerData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono.trim(),
        carrera: formData.carrera.trim()
      };

      const result = await authService.register(registerData);

      if (result.success) {
        toast.success(`¡Registro exitoso! Bienvenido ${result.user?.nombre || 'Usuario'}`);
        console.log('✅ Registro exitoso:', result);
        
        // Redirigir a welcome
        navigate('/welcome');
      } else {
        console.error('❌ Error en registro:', result.error);
        toast.error(result.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('❌ Error inesperado en registro:', error);
      toast.error('Error inesperado en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== NAVEGACIÓN ==========
  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="tecsup-login-container">
      <div className="tecsup-unified-card">
        {/* Lado izquierdo - Formulario de Registro */}
        <div className="tecsup-form-side">
          <div className="tecsup-form-container">
            {/* Header */}
            <div className="tecsup-header">
              <div className="tecsup-logo">
                <span className="tecsup-logo-text">Sistema CV</span>
                <span className="tecsup-tagline">CREAR CUENTA</span>
              </div>
              <h1 className="tecsup-system-title">
                Registro de Usuario
              </h1>
            </div>

            {/* Formulario */}
            <form className="tecsup-form" onSubmit={handleRegister}>
              {/* Nombre y Apellido */}
              <div className="tecsup-input-row">
                <div className="tecsup-input-group half-width">
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre *"
                    className="tecsup-input"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="tecsup-input-group half-width">
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Apellido *"
                    className="tecsup-input"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="tecsup-input-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico *"
                  className="tecsup-input"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Teléfono */}
              <div className="tecsup-input-group">
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="tecsup-input"
                  disabled={isLoading}
                />
              </div>

              {/* Carrera */}
              <div className="tecsup-input-group">
                <select
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                  className="tecsup-input"
                  disabled={isLoading}
                >
                  <option value="">Selecciona tu carrera</option>
                  <option value="Administración de Negocios Internacionales">Administración de Negocios Internacionales</option>
                  <option value="Computación e Informática">Computación e Informática</option>
                  <option value="Electrotecnia Industrial">Electrotecnia Industrial</option>
                  <option value="Electrónica y Automatización Industrial">Electrónica y Automatización Industrial</option>
                  <option value="Mantenimiento de Maquinaria de Planta">Mantenimiento de Maquinaria de Planta</option>
                  <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                  <option value="Mecatrónica Industrial">Mecatrónica Industrial</option>
                  <option value="Procesos Químicos y Metalúrgicos">Procesos Químicos y Metalúrgicos</option>
                  <option value="Producción y Gestión Industrial">Producción y Gestión Industrial</option>
                  <option value="Tecnología Digital">Tecnología Digital</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              {/* Contraseña */}
              <div className="tecsup-input-group">
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña *"
                    className="tecsup-input"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="tecsup-input-group">
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña *"
                    className="tecsup-input"
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Botón de Registro */}
              <button 
                type="submit" 
                className="tecsup-login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-container">
                    <div className="loading-spinner"></div>
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              {/* Enlace para volver al login */}
              <div className="tecsup-register">
                <span>¿Ya tienes una cuenta? </span>
                <a 
                  href="#" 
                  className="tecsup-register-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBackToLogin();
                  }}
                >
                  Iniciar Sesión
                </a>
              </div>

              {/* Términos y condiciones */}
              <div className="tecsup-terms">
                <small>
                  Al crear una cuenta, aceptas nuestros{' '}
                  <a href="#" className="tecsup-link">Términos de Servicio</a>{' '}
                  y{' '}
                  <a href="#" className="tecsup-link">Política de Privacidad</a>
                </small>
              </div>
            </form>
          </div>
        </div>

        {/* Lado derecho - Imagen */}
        <div className="tecsup-image-side">
          <div className="tecsup-image-overlay">
            <div className="tecsup-center-image">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1484&q=80"
                alt="Estudiantes universitarios colaborando"
                className="tecsup-main-image"
                loading="lazy"
              />
              <div className="tecsup-image-caption">
                Únete a la Comunidad
              </div>
              <div className="tecsup-image-subcaption">
                Impulsa tu carrera profesional
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;