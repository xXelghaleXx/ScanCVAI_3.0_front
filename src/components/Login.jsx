import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ========== DEBUGGING Y VERIFICACIONES ==========
  useEffect(() => {
    console.log('🔍 INICIANDO DEBUGGING DE LOGIN');
    
    // Variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    
    // URLs que se van a usar
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('🌐 Base URL calculada:', baseURL);
    console.log('🌐 Login URL será:', `${baseURL}/auth/login`);
    
    // Verificar origen actual
    console.log('🌍 Origen actual:', window.location.origin);
    console.log('🌍 Puerto actual:', window.location.port);
    
    // Verificar si ya está autenticado
    if (authService.isAuthenticated()) {
      console.log('✅ Usuario ya autenticado, redirigiendo...');
      navigate('/welcome');
    }
    
    // Test de conectividad básica
    testConnectivity();
  }, [navigate]);

  // ========== TEST DE CONECTIVIDAD ==========
  const testConnectivity = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const healthURL = baseURL.replace('/api', '/api/health');
      
      console.log('🏥 Probando health check:', healthURL);
      
      const response = await fetch(healthURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🏥 Health check status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🏥 Backend saludable:', data);
        toast.success('✅ Conexión con backend exitosa');
      } else {
        console.warn('⚠️ Backend responde pero con error:', response.status);
        toast.warn('⚠️ Backend responde con errores');
      }
      
    } catch (error) {
      console.error('❌ No se puede conectar al backend:', error);
      toast.error('❌ No se puede conectar al backend. ¿Está corriendo en puerto 3000?');
    }
  };

  // ========== LOGIN TRADICIONAL CON DEBUG ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('🔐 INICIANDO LOGIN TRADICIONAL');
    
    // Validación
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

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
      // Debug detallado
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const loginURL = `${baseURL}/auth/login`;
      const credentials = {
        correo: emailString,
        contrasena: passwordString,
        client_id: 'frontend_app',
        client_secret: '123456'
      };
      
      console.log('📤 Enviando petición de login:');
      console.log('URL:', loginURL);
      console.log('Método:', 'POST');
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      console.log('Body:', JSON.stringify(credentials, null, 2));
      
      // Hacer la petición
      const response = await fetch(loginURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('📥 Respuesta recibida:');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('OK:', response.ok);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      // Intentar obtener el cuerpo de la respuesta
      const responseText = await response.text();
      console.log('📄 Cuerpo de respuesta (texto):', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('📄 Cuerpo de respuesta (JSON):', responseData);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.log('📄 Respuesta no es JSON válido:', responseText);
        toast.error('Error: Respuesta del servidor no válida');
        return;
      }
      
      if (response.ok && responseData.access_token) {
        // Login exitoso
        console.log('✅ Login exitoso!');
        
        // Guardar tokens
        localStorage.setItem('access_token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);
        localStorage.setItem('token_type', responseData.token_type);
        localStorage.setItem('expires_in', responseData.expires_in);
        
        // Decodificar usuario
        try {
          const payload = JSON.parse(atob(responseData.access_token.split('.')[1]));
          const userData = {
            id: payload.id,
            email: payload.correo,
            iat: payload.iat,
            exp: payload.exp
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('nombre', userData.email);
          
          console.log('👤 Usuario decodificado:', userData);
          toast.success(`¡Bienvenido ${userData.email}!`);
        } catch (jwtError) {
          console.warn('⚠️ Error decodificando JWT:', jwtError);
          toast.success('¡Login exitoso!');
        }
        
        // Redirigir
        console.log('🚀 Redirigiendo a welcome...');
        navigate('/welcome');
        
      } else {
        // Login fallido
        console.error('❌ Login fallido:', responseData);
        const errorMessage = responseData.error || responseData.message || `Error ${response.status}`;
        toast.error(errorMessage);
      }
      
    } catch (networkError) {
      console.error('❌ ERROR DE RED:', networkError);
      console.error('Tipo de error:', networkError.name);
      console.error('Mensaje:', networkError.message);
      console.error('Stack:', networkError.stack);
      
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        toast.error('❌ Error de conexión: ¿El backend está corriendo en puerto 3000?');
      } else {
        toast.error(`❌ Error de red: ${networkError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RESTO DEL COMPONENTE ==========
  const handleGoogleSuccess = async (response) => {
    // ... código de Google login igual que antes
    console.log('🔐 Google login iniciado...');
    // Implementar igual que antes pero con más logging
  };

  const handleGoogleError = (error) => {
    console.error('❌ Error de Google OAuth:', error);
    toast.error('Error al conectar con Google');
  };

  const handleRegister = () => navigate('/register');
  const handleForgotPassword = () => toast.info('Funcionalidad en desarrollo');

  // ========== BOTÓN DE DEBUG ==========
  const handleDebugTest = async () => {
    console.log('🧪 EJECUTANDO TEST DE DEBUG');
    await testConnectivity();
    
    // Test de authService
    try {
      console.log('🧪 Probando authService...');
      const result = await authService.login({
        email: 'test@test.com',
        password: 'test123'
      });
      console.log('🧪 Resultado authService:', result);
    } catch (error) {
      console.error('🧪 Error en authService:', error);
    }
  };

  return (
    <div className="tecsup-login-container">
      <div className="tecsup-unified-card">
        <div className="tecsup-form-side">
          <div className="tecsup-form-container">
            
            {/* Header */}
            <div className="tecsup-header">
              <div className="tecsup-logo">
                <span className="tecsup-logo-text">Sistema CV</span>
                <span className="tecsup-tagline">ENTREVISTAS CON IA</span>
              </div>
              <h1 className="tecsup-system-title">
                Sistema de Análisis CV & Entrevistas
              </h1>
            </div>

            {/* Botón de Debug (solo en desarrollo) */}
            {import.meta.env.DEV && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={handleDebugTest}
                  style={{
                    background: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  🧪 Test Debug
                </button>
              </div>
            )}

            {/* Formulario */}
            <form className="tecsup-form" onSubmit={handleLogin}>
              <div className="tecsup-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="tecsup-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="tecsup-input-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="tecsup-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="tecsup-forgot-password">
                <a href="#" className="tecsup-forgot-link" onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}>
                  ¿Olvidó la contraseña?
                </a>
              </div>

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

              <div className="tecsup-divider">
                <span>o</span>
              </div>

              <div className="tecsup-google-container">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    text="signin_with"
                    size="large"
                  />
                ) : (
                  <div className="google-config-warning">
                    Google Login no configurado
                  </div>
                )}
              </div>

              <div className="tecsup-register">
                <span>¿No tienes una cuenta? </span>
                <a href="#" className="tecsup-register-link" onClick={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}>
                  Crear una cuenta
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Lado derecho igual que antes */}
        <div className="tecsup-image-side">
          <div className="tecsup-image-overlay">
            <div className="tecsup-center-image">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                alt="Análisis CV"
                className="tecsup-main-image"
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