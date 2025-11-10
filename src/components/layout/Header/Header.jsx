import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../../../styles/layout/Header.css";
import Slidebar from "../Sidebar/Slidebar";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FaPowerOff, FaUserCircle, FaUserShield } from "react-icons/fa";
import authService from '../../../services/auth.service';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const [nombreCompleto, setNombreCompleto] = useState("");

  // Función para obtener el nombre a mostrar
  const getNombreCompleto = () => {
    // Obtener usuario del authService
    const user = authService.getUser();

    // Prioridad 1: localStorage 'nombre' (actualizado desde perfil)
    const nombreStorage = localStorage.getItem("nombre");
    if (nombreStorage && nombreStorage.trim() && !nombreStorage.includes('@')) {
      return nombreStorage.trim();
    }

    // Prioridad 2: user.nombre del objeto parseado
    if (user?.nombre && !user.nombre.includes('@')) {
      return user.nombre;
    }

    // Prioridad 3: email sin dominio
    if (user?.email) {
      return user.email.split('@')[0];
    }

    if (user?.correo) {
      return user.correo.split('@')[0];
    }

    // Fallback
    return "Usuario";
  };

  // Cargar nombre al montar y cuando cambie el localStorage
  useEffect(() => {
    setNombreCompleto(getNombreCompleto());

    // Escuchar cambios en el perfil
    const handleProfileUpdate = () => {
      setNombreCompleto(getNombreCompleto());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Obtener usuario para verificar rol
  const user = authService.getUser();

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
          <h1 className="logo-text">Tecsup</h1>
          <div className="separator"></div>
          <Slidebar />
        </div>

        <div className="user-info">
          <span className="user-name">{nombreCompleto}</span>

          <ThemeToggle />

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