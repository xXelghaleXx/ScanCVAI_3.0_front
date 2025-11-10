import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaPowerOff, FaUserShield } from "react-icons/fa";
import "../../../styles/layout/Slidebar.css";
import logo from "../../../assets/logo.png";
import authService from '../../../services/auth.service';

const Slidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const slidebarRef = useRef(null);
  const navigate = useNavigate();

  const toggleSlidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (slidebarRef.current && !slidebarRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const user = authService.getUser();
    const nombreStorage = localStorage.getItem("nombre");

    if (nombreStorage && nombreStorage.trim() && !nombreStorage.includes('@')) {
      setNombreCompleto(nombreStorage.trim());
    } else if (user?.nombre && !user.nombre.includes('@')) {
      setNombreCompleto(user.nombre);
    } else if (user?.email) {
      setNombreCompleto(user.email.split('@')[0]);
    } else {
      setNombreCompleto("Usuario");
    }
  }, [isOpen]);

  const handleLogout = () => {
    authService.logout();
    setIsOpen(false);
    navigate("/");
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate("/perfil");
  };

  const handleAdmin = () => {
    setIsOpen(false);
    navigate("/admin");
  };

  const user = authService.getUser();
  const isAdmin = user?.rol === 'administrador';

  return (
    <div className="slidebar-container" ref={slidebarRef}>
      <input className="slidebar-toggle" type="checkbox" checked={isOpen} onChange={toggleSlidebar} />
      <div className={`slidebar-icon ${isOpen ? "hide" : ""}`} onClick={toggleSlidebar}>
        <span className="top-bar common-bar"></span>
        <span className="middle-bar common-bar"></span>
        <span className="bottom-bar common-bar"></span>
      </div>
      <div className={`slidebar-menu ${isOpen ? "open" : ""}`}>
        <div className="menu-header">
          <img src={logo} alt="Tecsup logo" className="logo-slidebar" />
        </div>

        {/* Usuario info solo en móviles */}
        <div className="menu-user-info">
          <div className="menu-user-avatar">
            <FaUserCircle />
          </div>
          <span className="menu-user-name">{nombreCompleto}</span>
        </div>

        <ul className="menu-list">
          <li className="menu-item"><Link className="menu-link" to="/welcome" onClick={toggleSlidebar}>Inicio</Link></li>

          {isAdmin ? (
            <>
              <li className="menu-item"><Link className="menu-link" to="/admin/usuarios" onClick={toggleSlidebar}>Gestión de Usuarios</Link></li>
              <li className="menu-item"><Link className="menu-link" to="/admin" onClick={toggleSlidebar}>Métricas Globales</Link></li>
            </>
          ) : (
            <>
              <li className="menu-item"><Link className="menu-link" to="/lector-cv" onClick={toggleSlidebar}>Lector de C.V.</Link></li>
              <li className="menu-item"><Link className="menu-link" to="/entrevista" onClick={toggleSlidebar}>Simulacion de entrevista</Link></li>
              <li className="menu-item"><Link className="menu-link" to="/HistorialCV" onClick={toggleSlidebar}>Historial CV</Link></li>
            </>
          )}
        </ul>

        {/* Opciones de usuario solo en móviles */}
        <div className="menu-user-actions">
          {isAdmin && (
            <button className="menu-action-btn menu-admin-btn" onClick={handleAdmin}>
              <FaUserShield />
              <span>Panel Admin</span>
            </button>
          )}
          <button className="menu-action-btn menu-profile-btn" onClick={handleProfile}>
            <FaUserCircle />
            <span>Mi Perfil</span>
          </button>
          <button className="menu-action-btn menu-logout-btn" onClick={handleLogout}>
            <FaPowerOff />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slidebar;
