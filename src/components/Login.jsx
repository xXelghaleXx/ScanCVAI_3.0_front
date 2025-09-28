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

  const handleRegister = () => setIsSignUp(true);
  const handleLoginClick = () => setIsSignUp(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: email.trim(),
      contrasena: password.trim(),
    };
    try {
      await authService.registro(formData);
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsSignUp(false); // Vuelve al panel de login
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Error al registrar el usuario';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
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
      <div className={`tecsup-unified-card ${isSignUp ? 'register-mode' : ''}`}>

        {/* Contenedor del Formulario de Registro */}
        <div className="tecsup-form-side sign-up-container">
          <div className="tecsup-form-container">
            <form onSubmit={handleRegisterSubmit} className="tecsup-form">
              <div className="tecsup-header">
                <h1 className="tecsup-logo-text">Crear Cuenta</h1>
              </div>
              <div className="tecsup-input-group">
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="tecsup-input" required />
              </div>
              <div className="tecsup-input-group">
                <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className="tecsup-input" required />
              </div>
              <div className="tecsup-input-group">
                <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="tecsup-input" required />
              </div>
              <div className="tecsup-input-group">
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="tecsup-input" required />
              </div>
              <button type="submit" className="tecsup-login-btn" disabled={isLoading}>{isLoading ? 'Registrando...' : 'Registrarse'}</button>
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
                <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="tecsup-input" required />
              </div>
              <div className="tecsup-input-group">
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="tecsup-input" required />
              </div>
              <div className="tecsup-forgot-password">
                <a href="#" className="tecsup-forgot-link" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>
                  ¿Olvidó la contraseña?
                </a>
              </div>

              <button type="submit" className="tecsup-login-btn" disabled={isLoading}>{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}</button>

              <div className="tecsup-divider">
                <span>o</span>
              </div>

              <div className="tecsup-google-container">
                 <button type="button" className="tecsup-google-btn" onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}>
                    <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google icon" width="20" height="20" className="tecsup-google-icon" />
                    <span>Iniciar sesión con Google</span>
                </button>
              </div>

              <div className="tecsup-register">
                <span>¿No tienes una cuenta? </span>
                <a href="#" className="tecsup-register-link" onClick={(e) => { e.preventDefault(); handleRegister(); }}>
                  Crear una cuenta
                </a>
              </div>
            </form>
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