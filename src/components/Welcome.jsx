import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, MessageCircle, TrendingUp, Clock, Award, Brain } from "lucide-react";
import authService from "../services/authService";

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Obtener datos del usuario
    const userData = authService.getCurrentUser();
    setUser(userData);

    // Actualizar reloj cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Obtener datos del dashboard (opcional)
    loadDashboardData();

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Si tienes un servicio de dashboard, úsalo aquí
      // const result = await dashboardService.getDashboard();
      // if (result.success) {
      //   setDashboardData(result.data);
      // }
      
      // Datos mock mientras tanto
      setDashboardData({
        resumen: {
          total_cvs: 12,
          total_entrevistas: 8,
          total_informes: 15
        }
      });
    } catch (error) {
      console.log('Dashboard data not available');
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getUserName = () => {
    // Obtener nombre del localStorage
    const nombreCompleto = localStorage.getItem("nombre");
    if (nombreCompleto) return nombreCompleto.split(' ')[0];
    
    if (user?.nombre) return user.nombre.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return "Usuario";
  };

  const features = [
    {
      id: 'cv-analyzer',
      title: 'Analizador de CV',
      description: 'Sube tu CV y obtén un análisis detallado con IA para identificar fortalezas y áreas de mejora.',
      icon: FileText,
      route: '/lector-cv',
      color: 'blue',
      stats: dashboardData?.resumen?.total_cvs || 0,
      statsLabel: 'CVs analizados'
    },
    {
      id: 'interview-sim',
      title: 'Simulador de Entrevistas',
      description: 'Practica entrevistas laborales con IA y recibe retroalimentación personalizada.',
      icon: MessageCircle,
      route: '/entrevista',
      color: 'green',
      stats: dashboardData?.resumen?.total_entrevistas || 0,
      statsLabel: 'entrevistas realizadas'
    }
  ];

  const quickActions = [
    {
      icon: TrendingUp,
      title: 'Ver mi progreso',
      description: 'Estadísticas y analytics',
      action: () => navigate('/dashboard')
    },
    {
      icon: Clock,
      title: 'Historial de CVs',
      description: 'Revisar análisis anteriores',
      action: () => navigate('/historialCV')
    },
    {
      icon: Award,
      title: 'Mis certificados',
      description: 'Logros y reconocimientos',
      action: () => console.log('Próximamente')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="welcome-container">
      <motion.div 
        className="welcome-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div className="welcome-header" variants={itemVariants}>
          <div className="greeting-section">
            <h1 className="greeting-text">
              {getGreeting()}, <span className="user-name">{getUserName()}</span>
            </h1>
            <p className="welcome-subtitle">
              ¿Listo para impulsar tu carrera profesional hoy?
            </p>
          </div>
          <div className="time-section">
            <div className="current-time">
              {currentTime.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="current-date">
              {currentTime.toLocaleDateString('es-ES', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Features */}
        <motion.div className="features-section" variants={itemVariants}>
          <h2 className="section-title">
            <Brain className="section-icon" />
            Herramientas principales
          </h2>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  className={`feature-card feature-${feature.color}`}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(feature.route)}
                >
                  <div className="feature-header">
                    <div className={`feature-icon-wrapper ${feature.color}`}>
                      <IconComponent className="feature-icon" size={24} />
                    </div>
                    <div className="feature-stats">
                      <span className="stats-number">{feature.stats}</span>
                      <span className="stats-label">{feature.statsLabel}</span>
                    </div>
                  </div>
                  
                  <div className="feature-content">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                  
                  <div className="feature-action">
                    <span className="action-text">Comenzar ahora</span>
                    <motion.div 
                      className="action-arrow"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="quick-actions-section" variants={itemVariants}>
          <h3 className="section-subtitle">Acciones rápidas</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.button
                  key={index}
                  className="quick-action-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                >
                  <IconComponent className="quick-action-icon" size={20} />
                  <div className="quick-action-content">
                    <span className="quick-action-title">{action.title}</span>
                    <span className="quick-action-desc">{action.description}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Indicator (if data available) */}
        {dashboardData && (
          <motion.div className="progress-section" variants={itemVariants}>
            <div className="progress-card">
              <h4 className="progress-title">Tu progreso</h4>
              <div className="progress-stats">
                <div className="progress-item">
                  <span className="progress-label">CVs procesados</span>
                  <span className="progress-value">{dashboardData.resumen?.total_cvs || 0}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Entrevistas</span>
                  <span className="progress-value">{dashboardData.resumen?.total_entrevistas || 0}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Informes</span>
                  <span className="progress-value">{dashboardData.resumen?.total_informes || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Welcome;