import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ========== CONFIGURACIÓN Y VERIFICACIONES ==========
  useEffect(() => {
    // Debug de variables de entorno
    console.log('🔍 Variables de entorno:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('MODE:', import.meta.env.MODE);

    // Verificar que las variables estén configuradas
    if (!import.meta.env.VITE_API_URL) {
      console.error('❌ VITE_API_URL no configurada');
      toast.error('Error: URL de API no configurada');
    }
    
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.error('❌ VITE_GOOGLE_CLIENT_ID no configurada');
      toast.error('Error: Google Client ID no configurado');
    }
  }, []);

  // ========== FUNCIÓN DE LOGIN TRADICIONAL (SIN AUTHSERVICE) ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validación con verificación de tipos
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    // Asegurar que email es un string
    const emailString = String(email || '').trim();
    const passwordString = String(password || '').trim();

    if (!emailString || !passwordString) {
      toast.error('Por favor, ingresa email y contraseña válidos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailString)) {
      toast.error('Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Intentando login tradicional con:', { email: emailString });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: emailString,
          password: passwordString
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      // Verificar si el login fue exitoso basado en la presencia de access_token
      if (data.access_token) {
        // Guardar datos en localStorage según la estructura de tu API
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('expires_in', data.expires_in);
        
        // Decodificar el JWT para obtener información del usuario
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          const userData = {
            id: payload.id,
            email: payload.correo,
            iat: payload.iat,
            exp: payload.exp
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          toast.success(`¡Bienvenido ${userData.email}!`);
        } catch (jwtError) {
          console.warn('No se pudo decodificar el JWT:', jwtError);
          toast.success('¡Login exitoso!');
        }
        
        console.log('✅ Login exitoso, redirigiendo...');
        
        // Redirigir a welcome
        navigate('/welcome');
      } else {
        const errorMessage = data.error || data.message || 'Credenciales inválidas';
        console.error('❌ Error en login:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== FUNCIÓN DE LOGIN CON GOOGLE (SIN AUTHSERVICE) ==========
  const handleGoogleSuccess = async (response) => {
    console.log('🔐 Google response:', response);
    
    if (response?.credential) {
      setIsLoading(true);
      
      try {
        console.log('📤 Enviando token de Google al backend...');
        
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        
        const backendResponse = await fetch(`${apiUrl}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            credential: response.credential
          })
        });

        console.log('📥 Google backend response status:', backendResponse.status);

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('❌ Google backend error:', errorText);
          throw new Error(`Error ${backendResponse.status}: ${errorText}`);
        }

        const data = await backendResponse.json();
        console.log('✅ Google login response:', data);

        // Verificar si el login con Google fue exitoso basado en la presencia de access_token
        if (data.access_token) {
          // Guardar datos en localStorage según la estructura de tu API
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('token_type', data.token_type);
          localStorage.setItem('expires_in', data.expires_in);
          
          // Decodificar el JWT para obtener información del usuario
          try {
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            const userData = {
              id: payload.id,
              email: payload.correo,
              iat: payload.iat,
              exp: payload.exp
            };
            localStorage.setItem('user', JSON.stringify(userData));
            
            toast.success(`¡Bienvenido ${userData.email}!`);
          } catch (jwtError) {
            console.warn('No se pudo decodificar el JWT:', jwtError);
            toast.success('¡Login con Google exitoso!');
          }
          
          console.log('✅ Google login exitoso, redirigiendo...');
          
          // Redirigir a welcome
          navigate('/welcome');
        } else {
          const errorMessage = data.error || data.message || 'Error en la autenticación con Google';
          console.error('❌ Error en Google login:', errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('❌ Error inesperado en Google login:', error);
        toast.error(`Error de conexión con Google: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('❌ No se recibió credential de Google');
      toast.error('No se pudo obtener la información de Google');
    }
  };

  const handleGoogleError = (error) => {
    console.error('❌ Error de Google OAuth:', error);
    toast.error('Error al conectar con Google. Por favor, inténtalo de nuevo.');
    setIsLoading(false);
  };

  // ========== NAVEGACIÓN ==========
  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    toast.info('Funcionalidad de recuperación de contraseña en desarrollo');
  };

  return (
    <div className="tecsup-login-container">
      {/* Gran cuadro unificado */}
      <div className="tecsup-unified-card">
        {/* Lado izquierdo - Formulario */}
        <div className="tecsup-form-side">
          <div className="tecsup-form-container">
            {/* Header y Logo */}
            <div className="tecsup-header">
              <div className="tecsup-logo">
                <span className="tecsup-logo-text">Sistema CV</span>
                <span className="tecsup-tagline">ENTREVISTAS CON IA</span>
              </div>
              <h1 className="tecsup-system-title">
                Sistema de Análisis CV & Entrevistas
              </h1>
            </div>

            {/* Formulario de Login */}
            <form className="tecsup-form" onSubmit={handleLogin}>
              {/* Campo Email */}
              <div className="tecsup-input-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="tecsup-input"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Campo Password */}
              <div className="tecsup-input-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="tecsup-input"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* Enlace de contraseña olvidada */}
              <div className="tecsup-forgot-password">
                <a 
                  href="#" 
                  className="tecsup-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  ¿Olvidó la contraseña?
                </a>
              </div>

              {/* Botón de Login */}
              <button 
                type="submit" 
                className="tecsup-login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-container">
                    <div className="loading-spinner"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              {/* Divisor */}
              <div className="tecsup-divider">
                <span>o</span>
              </div>

              {/* Google Login - Solo si está configurado */}
              <div className="tecsup-google-container">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && !isLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      text="signin_with"
                      size="large"
                      width="300"
                      useOneTap={false}
                      auto_select={false}
                    />
                  </div>
                ) : !import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div className="google-config-warning">
                    Google Login no configurado - Verifica VITE_GOOGLE_CLIENT_ID en .env
                  </div>
                ) : (
                  <div className="google-loading">
                    <div className="loading-spinner"></div>
                    Procesando con Google...
                  </div>
                )}
              </div>

              {/* Enlace de registro */}
              <div className="tecsup-register">
                <span>¿No tienes una cuenta? </span>
                <a 
                  href="#" 
                  className="tecsup-register-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRegister();
                  }}
                >
                  Crear una cuenta
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Lado derecho - Imagen */}
        <div className="tecsup-image-side">
          <div className="tecsup-image-overlay">
            <div className="tecsup-center-image">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Estudiantes trabajando en análisis CV"
                className="tecsup-main-image"
                loading="lazy"
              />
              <div className="tecsup-image-caption">
                Análisis Inteligente de CV
              </div>
              <div className="tecsup-image-subcaption">
                Preparación para entrevistas con IA
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;