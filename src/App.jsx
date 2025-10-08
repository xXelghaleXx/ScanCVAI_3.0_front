// src/App.jsx
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import LectorCV from "./components/LectorCV";
import HistorialCV from "./components/HistorialCV";
import ChatEntrevista from "./components/Entrevista";
import Perfil from './components/Perfil';
import Background from "./components/Background";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";
import entrevistaService from "./services/entrevistaService";

// IMPORTAR CSS EN EL ORDEN CORRECTO
import "./styles/layout-refactorizado.css";
import "./styles/Welcome-refactorizado.css";
import "./styles/Chat.css";
import "./index.css";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/register";

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (import.meta.env.DEV) {
    console.log('🔑 Google Client ID configurado:', GOOGLE_CLIENT_ID ? 'SÍ' : 'NO');
    console.log('🔑 Client ID (primeros 30 chars):', GOOGLE_CLIENT_ID?.substring(0, 30) + '...');
    console.log('🔑 Client ID válido:', GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') ? 'SÍ' : 'NO');
    
    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ VITE_GOOGLE_CLIENT_ID no está definido en .env');
      console.warn('📝 Agrega VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com en tu archivo .env');
    } else if (!GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
      console.warn('⚠️ El Client ID no parece tener el formato correcto');
      console.warn('📝 Debe terminar en .apps.googleusercontent.com');
    }
  }

  const handleLogout = () => {
    console.log("Usuario ha cerrado sesión");
    authService.logout();
    entrevistaService.limpiarEntrevistaLocal();
    window.location.href = "/";
  };

  if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            ❌ Configuración de Google OAuth Faltante
          </h1>
          <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
            <strong>No se encontró VITE_GOOGLE_CLIENT_ID en las variables de entorno.</strong>
          </p>
          
          <div style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            <h3>📝 Para solucionarlo:</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li>Crea/edita el archivo <code>.env</code> en la raíz del proyecto</li>
              <li>Agrega: <code>VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com</code></li>
              <li>Reinicia el servidor de desarrollo: <code>npm run dev</code></li>
            </ol>
          </div>
          
          <div style={{ textAlign: 'left', backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
            <h3>🔗 ¿No tienes un Client ID?</h3>
            <p>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> y configura OAuth 2.0</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) => {
        console.error('❌ Error cargando script de Google OAuth:', error);
      }}
      onScriptLoadSuccess={() => {
        console.log('✅ Script de Google OAuth cargado correctamente');
      }}
    >
      <div className="app-root">
        <div className="background-wrapper">
          <Background />
        </div>

        {!isLoginPage && (
          <div className="header-container">
            <Header onLogout={handleLogout} />
          </div>
        )}

        <div className="main-content-wrapper">
          <Routes>
            {/* Páginas de autenticación */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Welcome */}
            <Route path="/welcome" element={
              <ProtectedRoute>
                <div className="welcome-main-wrapper">
                  <Welcome />
                </div>
              </ProtectedRoute>
            } />
            
            {/* Lector CV */}
            <Route path="/lector-cv" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <LectorCV />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Entrevista */}
            <Route path="/entrevista" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <ChatEntrevista />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Historial CV */}
            <Route path="/historialCV" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <HistorialCV />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Perfil */}
            <Route path="/perfil" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <Perfil />
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>

        {!isLoginPage && (
          <div className="footer-container">
            <Footer />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;