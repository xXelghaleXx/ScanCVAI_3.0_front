import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import Slidebar from "./Slidebar";
import logo from "../assets/logo.png";
import { FaPowerOff, FaUserCircle, FaUserShield } from "react-icons/fa";
import authService from "../services/authService";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  
  // Obtener usuario del authService
  const user = authService.getUser();
  
  // Prioridad: user.nombre > localStorage.nombre > email sin @dominio > Usuario
  let nombreCompleto = "Usuario";
  
  if (user?.nombre) {
    nombreCompleto = user.nombre;
  } else if (localStorage.getItem("nombre") && !localStorage.getItem("nombre").includes("@")) {
    nombreCompleto = localStorage.getItem("nombre");
  } else if (user?.email) {
    nombreCompleto = user.email.split('@')[0];
  } else if (user?.correo) {
    nombreCompleto = user.correo.split('@')[0];
  }
  
  const primerNombre = nombreCompleto.split(' ')[0];

  const handleLogout = () => {
    authService.logout(); // Usa el método de authService que ya limpia todo
    
    if (onLogout) {
      onLogout();
    }
    
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/perfil");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  // Verificar si el usuario es administrador
  const isAdmin = user?.rol === 'administrador';

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-slidebar-container">
          <img src={logo} alt="Tecsup logo" className="logo" />
          <div className="separator"></div>
          <Slidebar />
        </div>

        <div className="user-info">
          <span className="user-name">{primerNombre}</span>

          {isAdmin && (
            <button
              className="admin-button"
              onClick={handleAdminClick}
              aria-label="Panel de administrador"
              title="Panel de administrador"
            >
              <FaUserShield className="admin-icon" />
            </button>
          )}

          <button
            className="profile-button"
            onClick={handleProfileClick}
            aria-label="Ver perfil"
            title="Mi perfil"
          >
            <FaUserCircle className="profile-icon" />
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <FaPowerOff className="logout-icon" />
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  onLogout: PropTypes.func,
};

export default Header;