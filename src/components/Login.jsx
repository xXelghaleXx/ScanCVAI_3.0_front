import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import '../styles/Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ========== DEBUGGING Y VERIFICACIONES ==========
  useEffect(() => {
    console.log('🔍 INICIANDO DEBUGGING DE LOGIN');
    
    // Verificar authService
    console.log('📋 AuthService cargado:', !!authService);
    console.log('📋 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
    console.log('📋 loginWithGoogle disponible:', typeof authService.loginWithGoogle === 'function');
    
    // Variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    
    // Verificar Google Client ID
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('❌ GOOGLE CLIENT ID NO CONFIGURADO');
      toast.error('❌ Google Client ID no configurado');
    } else if (!clientId.includes('.apps.googleusercontent.com')) {
      console.warn('⚠️ Client ID puede ser incorrecto (debe terminar en .apps.googleusercontent.com)');
      toast.warn('⚠️ Verificar formato del Client ID');
    } else {
      console.log('✅ Google Client ID parece correcto');
    }
    
    // URLs que se van a usar
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('🌐 Base URL calculada:', baseURL);
    console.log('🌐 Login URL será:', `${baseURL}/auth/login`);
    console.log('🌐 Google callback URL será:', `${baseURL}/auth/google/callback`);
    
    // Verificar origen actual
    console.log('🌍 Origen actual:', window.location.origin);
    console.log('🌍 Puerto actual:', window.location.port);
    console.log('🌍 Host completo:', window.location.host);
    
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
      } else {
        console.warn('⚠️ Backend responde pero con error:', response.status);
      }
      
    } catch (error) {
      console.error('❌ No se puede conectar al backend:', error);
    }
  };

  // ========== LOGIN TRADICIONAL ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('🔐 INICIANDO LOGIN TRADICIONAL');
    
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailString)) {
      toast.error('Por favor, ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Intentando login con authService...');
      
      const result = await authService.login({
        email: emailString,
        password: passwordString
      });

      if (result.success) {
        console.log('✅ Login tradicional exitoso:', result.user);
        toast.success(`¡Bienvenido ${result.user.email}!`);
        navigate('/welcome');
      } else {
        console.error('❌ Login tradicional fallido:', result.error);
        toast.error(result.error);
      }
      
    } catch (error) {
      console.error('❌ ERROR EN LOGIN TRADICIONAL:', error);
      toast.error(`❌ Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== LOGIN CON GOOGLE ==========
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('🔐 INICIANDO LOGIN CON GOOGLE');
      console.log('📄 Credential Response completo:', credentialResponse);
      console.log('🎫 JWT Token recibido:', credentialResponse.credential?.substring(0, 50) + '...');
      
      // Verificar que authService tiene el método
      if (typeof authService.loginWithGoogle !== 'function') {
        console.error('❌ authService.loginWithGoogle no es una función');
        console.log('Métodos disponibles en authService:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
        toast.error('❌ Error: Método de login con Google no disponible');
        return;
      }
      
      setIsLoading(true);
      toast.info('🔐 Procesando login con Google...');
      
      // Verificar que tenemos el credential
      if (!credentialResponse.credential) {
        throw new Error('No se recibió credential de Google');
      }
      
      // Intentar decodificar el JWT para debug (solo header y payload, no verificamos signature)
      try {
        const parts = credentialResponse.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('👤 Info del usuario Google:', {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            aud: payload.aud // Esto debe coincidir con tu Client ID
          });
          
          // Verificar que el audience coincide con nuestro Client ID
          const ourClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
          if (payload.aud !== ourClientId) {
            console.error('❌ AUDIENCE MISMATCH:', {
              expected: ourClientId,
              received: payload.aud
            });
            toast.error('❌ Error de configuración de Google OAuth');
            return;
          }
        }
      } catch (decodeError) {
        console.warn('⚠️ No se pudo decodificar JWT para debug:', decodeError);
      }
      
      // Llamar al authService
      console.log('📤 Llamando a authService.loginWithGoogle...');
      const result = await authService.loginWithGoogle(credentialResponse.credential);
      
      console.log('📥 Resultado de authService.loginWithGoogle:', result);
      
      if (result && result.success) {
        console.log('✅ Login con Google exitoso:', result.user);
        toast.success(`¡Bienvenido ${result.user.email || result.user.nombre}!`);
        navigate('/welcome');
      } else {
        console.error('❌ Login con Google fallido:', result);
        const errorMessage = result?.error || 'Error al iniciar sesión con Google';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ Error en handleGoogleSuccess:', error);
      console.error('Stack trace:', error.stack);
      toast.error(`Error conectando con Google: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('❌ GOOGLE OAUTH ERROR:', error);
    console.error('Error type:', typeof error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Diferentes tipos de errores que puede devolver Google
    let errorMessage = 'Error al conectar con Google';
    
    if (typeof error === 'string') {
      errorMessage = `Google OAuth: ${error}`;
    } else if (error && error.error) {
      errorMessage = `Google OAuth: ${error.error}`;
    } else if (error && error.details) {
      errorMessage = `Google OAuth: ${error.details}`;
    }
    
    toast.error(errorMessage);
  };

  // ========== REGISTRO ==========
  const handleRegister = () => setIsSignUp(true);
  const handleLoginClick = () => setIsSignUp(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre || !apellido || !email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    const formData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: email.trim(),
      contrasena: password.trim(),
    };
    
    try {
      console.log('📝 Enviando datos de registro:', formData);
      const result = await authService.registro(formData);
      
      if (result.success) {
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsSignUp(false);
        // Limpiar campos
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
      } else {
        toast.error(result.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'Error al registrar el usuario';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => toast.info('Funcionalidad en desarrollo');

  // ========== DEBUG FUNCTION ==========
  const handleDebugTest = async () => {
    console.log('🧪 EJECUTANDO TEST COMPLETO DE DEBUG');
    
    // 1. Variables de entorno
    console.group('📋 Variables de entorno');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log('MODE:', import.meta.env.MODE);
    console.log('Todas las variables VITE_:', Object.entries(import.meta.env).filter(([key]) => key.startsWith('VITE_')));
    console.groupEnd();
    
    // 2. AuthService
    console.group('🔧 AuthService Status');
    console.log('authService:', authService);
    console.log('authService constructor:', authService.constructor.name);
    console.log('Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
    console.log('loginWithGoogle type:', typeof authService.loginWithGoogle);
    console.log('login type:', typeof authService.login);
    console.log('isAuthenticated type:', typeof authService.isAuthenticated);
    console.groupEnd();
    
    // 3. Conectividad
    console.group('🌐 Test de conectividad');
    await testConnectivity();
    console.groupEnd();
    
    // 4. Google OAuth status
    console.group('🔍 Google OAuth Status');
    console.log('window.google:', typeof window.google);
    console.log('gapi loaded:', typeof window.gapi !== 'undefined');
    console.log('Client ID format valid:', import.meta.env.VITE_GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com'));
    console.groupEnd();
    
    toast.info('🧪 Debug test completado - revisa la consola');
  };

  return (
    <div className="tecsup-login-container">
      <div className={`tecsup-unified-card ${isSignUp ? 'register-mode' : ''}`}>

        {/* Contenedor del Formulario de Registro */}
        <div className="tecsup-form-side sign-up-container">
          <div className="tecsup-form-container">
            <form onSubmit={handleRegisterSubmit} className="tecsup-form">
              <div className="tecsup-header">
                <h1 className="tecsup-logo-text">Crear Cuenta</h1>
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="text" 
                  placeholder="Apellido" 
                  value={apellido} 
                  onChange={(e) => setApellido(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="email" 
                  placeholder="Correo Electrónico" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="tecsup-login-btn" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>

        {/* Contenedor del Formulario de Login */}
        <div className="tecsup-form-side sign-in-container">
          <div className="tecsup-form-container">
            <form onSubmit={handleLogin} className="tecsup-form">
              <div className="tecsup-header">
                <h1 className="tecsup-logo-text">Iniciar Sesión</h1>
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="email" 
                  placeholder="Correo Electrónico" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="tecsup-input-group">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="tecsup-input" 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="tecsup-forgot-password">
                <a 
                  href="#" 
                  className="tecsup-forgot-link" 
                  onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}
                >
                  ¿Olvidó la contraseña?
                </a>
              </div>

              <button type="submit" className="tecsup-login-btn" disabled={isLoading}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>

              <div className="tecsup-divider">
                <span>o</span>
              </div>

              {/* GOOGLE LOGIN BUTTON */}
              <div className="tecsup-google-container">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                    disabled={isLoading}
                    auto_select={false}
                    cancel_on_tap_outside={true}
                  />
                ) : (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dadce0', 
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#5f6368'
                  }}>
                    ⚠️ Google Client ID no configurado
                  </div>
                )}
              </div>

              <div className="tecsup-register">
                <span>¿No tienes una cuenta? </span>
                <a 
                  href="#" 
                  className="tecsup-register-link" 
                  onClick={(e) => { e.preventDefault(); handleRegister(); }}
                >
                  Crear una cuenta
                </a>
              </div>
            </form>

            {/* Botón de Debug */}
            {import.meta.env.DEV && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  type="button" 
                  onClick={handleDebugTest}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '12px', 
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  🧪 Debug Completo
                </button>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  AuthService: {typeof authService.loginWithGoogle === 'function' ? '✅' : '❌'} | 
                  Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '✅' : '❌'}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Superposición (Overlay) */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de Nuevo!</h1>
              <p>Para mantenerte conectado, por favor inicia sesión con tu información personal.</p>
              <button className="ghost-btn" onClick={handleLoginClick}>Iniciar Sesión</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Hola, Amigo!</h1>
              <p>Ingresa tus datos personales y comienza tu viaje con nosotros.</p>
              <button className="ghost-btn" onClick={handleRegister}>Regístrate</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;