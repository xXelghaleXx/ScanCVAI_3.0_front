import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import LectorCV from "./components/LectorCV";
import HistorialCV from "./components/HistorialCV";
import ChatEntrevista from "./components/Entrevista";
import Background from "./components/Background";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import authService from "./services/authService";

// IMPORTAR CSS EN EL ORDEN CORRECTO
import "./styles/layout.css";        // ← PRIMERO: Layout base
import "./styles/Welcome.css";       // ← SEGUNDO: Welcome específico
import "./styles/Chat.css";          // ← TERCERO: Chat específico
import "./index.css";                // ← ÚLTIMO: Overrides globales

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/" || location.pathname === "/register";

  const handleLogout = () => {
    console.log("Usuario ha cerrado sesión");
    authService.logout();
    // Redirigir al login
    window.location.href = "/";
  };

  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_DE_GOOGLE">
      <div className="app-root">
        {/* Fondo global - siempre presente */}
        <div className="background-wrapper">
          <Background />
        </div>

        {/* Header - UNA SOLA VEZ, NO fixed */}
        {!isLoginPage && (
          <div className="header-container">
            <Header onLogout={handleLogout} />
          </div>
        )}

        {/* Contenido principal - flex: 1 */}
        <div className="main-content-wrapper">
          <Routes>
            {/* Páginas de autenticación - sin layout adicional */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Welcome - layout específico SIN Header/Footer internos */}
            <Route path="/welcome" element={
              <ProtectedRoute>
                <div className="welcome-main-wrapper">
                  <Welcome />
                </div>
              </ProtectedRoute>
            } />
            
            {/* Otras páginas - layout estándar */}
            <Route path="/lector-cv" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <LectorCV />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/entrevista" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <ChatEntrevista />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/historialCV" element={
              <ProtectedRoute>
                <div className="content-with-header">
                  <div className="page-container">
                    <HistorialCV />
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>

        {/* Footer - UNA SOLA VEZ, NO fixed */}
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