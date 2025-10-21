import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, MessageCircle, TrendingUp, Clock, Award, Brain } from "lucide-react";
import Background from "../../components/layout/Background/Background";
import authService from '../../services/auth.service';

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Obtener datos del usuario
    const userData = authService.getUser();
    setUser(userData);

    // Actualizar reloj cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Obtener datos del dashboard
    loadDashboardData();

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.warn('⚠️ No hay token de autenticación');
        setError('No estás autenticado');
        setLoading(false);
        return;
      }

      console.log('📊 Cargando datos de CVs e informes...');

      // 📄 Obtener lista de CVs del endpoint GET /api/cv
      const cvsResponse = await fetch('http://localhost:3000/api/cv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!cvsResponse.ok) {
        throw new Error(`Error ${cvsResponse.status}: ${cvsResponse.statusText}`);
      }

      const cvsData = await cvsResponse.json();
      console.log('✅ CVs obtenidos:', cvsData);

      // 📋 Obtener lista de informes del endpoint GET /api/informes
      const informesResponse = await fetch('http://localhost:3000/api/informes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const informesData = await informesResponse.json();
      console.log('✅ Informes obtenidos:', informesData);

      // 🎯 Obtener historial de entrevistas del endpoint GET /api/entrevistas
      const entrevistasResponse = await fetch('http://localhost:3000/api/entrevistas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const entrevistasData = await entrevistasResponse.json();
      console.log('✅ Entrevistas obtenidas:', entrevistasData);

      // Estructurar los datos para el dashboard
      const dashboardStats = {
        total_cvs: cvsData.cvs?.length || 0,
        total_informes: informesData.informes?.length || 0,
        total_entrevistas: entrevistasData.entrevistas?.length || 0,
        
        // CVs procesados vs pendientes
        cvs_procesados: cvsData.cvs?.filter(cv => cv.contenido_extraido)?.length || 0,
        cvs_pendientes: cvsData.cvs?.filter(cv => !cv.contenido_extraido)?.length || 0,
        
        // CVs recientes (últimos 3)
        cvs_recientes: cvsData.cvs?.slice(0, 3) || [],
        
        // Informes recientes (últimos 3)
        informes_recientes: informesData.informes?.slice(0, 3) || [],
        
        // Entrevistas recientes (últimas 3)
        entrevistas_recientes: entrevistasData.entrevistas?.slice(0, 3) || [],
        
        // Calcular progreso (CVs procesados / total CVs)
        progreso_analisis: cvsData.cvs?.length > 0 
          ? Math.round((cvsData.cvs.filter(cv => cv.contenido_extraido).length / cvsData.cvs.length) * 100)
          : 0
      };

      console.log('📊 Dashboard stats calculados:', dashboardStats);
      setDashboardData(dashboardStats);
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      
      // Manejar error 401 (token expirado)
      if (error.message.includes('401')) {
        setError('Sesión expirada. Recargando...');
        // Dar tiempo para que el authService renueve el token
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError('Error al cargar los datos. Verifica tu conexión.');
      }
      
      // Valores por defecto en caso de error
      setDashboardData({
        total_cvs: 0,
        total_entrevistas: 0,
        total_informes: 0,
        cvs_procesados: 0,
        cvs_pendientes: 0,
        progreso_analisis: 0,
        cvs_recientes: [],
        informes_recientes: [],
        entrevistas_recientes: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

const getUserName = () => {
  // Obtener usuario desde authService
  const currentUser = authService.getUser();

  // Prioridad 1: localStorage 'nombre' (actualizado desde perfil)
  const nombreStorage = localStorage.getItem("nombre");
  if (nombreStorage && nombreStorage.trim() && !nombreStorage.includes('@')) {
    return nombreStorage.trim();
  }

  // Prioridad 2: user.nombre del objeto parseado
  if (currentUser?.nombre && !currentUser.nombre.includes('@')) {
    return currentUser.nombre;
  }

  // Prioridad 3: email sin dominio
  if (currentUser?.email) {
    return currentUser.email.split('@')[0];
  }

  if (currentUser?.correo) {
    return currentUser.correo.split('@')[0];
  }

  // Fallback
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
      stats: dashboardData?.total_cvs || 0,
      statsLabel: 'CVs analizados'
    },
    {
      id: 'interview-sim',
      title: 'Simulador de Entrevistas',
      description: 'Practica entrevistas laborales con IA y recibe retroalimentación personalizada.',
      icon: MessageCircle,
      route: '/entrevista',
      color: 'green',
      stats: dashboardData?.total_entrevistas || 0,
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
      description: `${dashboardData?.total_cvs || 0} CVs procesados`,
      action: () => navigate('/historialCV')
    },
    {
      icon: Award,
      title: 'Mis informes',
      description: `${dashboardData?.total_informes || 0} informes generados`,
      action: () => navigate('/historialCV')
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
    <>
      <Background />
      <div className="welcome-container">
        <motion.div
          className="welcome-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Error State */}
        {error && (
          <motion.div 
            className="error-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'var(--error-bg, #fee)',
              border: '1px solid var(--error-border, #fcc)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              color: 'var(--error-text, #c33)'
            }}
          >
            <p style={{ margin: 0 }}>⚠️ {error}</p>
            <button 
              onClick={loadDashboardData}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </motion.div>
        )}

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
            {features.map((feature) => {
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
                      {loading ? (
                        <div className="stats-loading">...</div>
                      ) : (
                        <>
                          <span className="stats-number">{feature.stats}</span>
                          <span className="stats-label">{feature.statsLabel}</span>
                        </>
                      )}
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

        {/* Progress Section */}
        {dashboardData && !loading && (
          <motion.div className="progress-section" variants={itemVariants}>
            <div className="progress-card">
              <h4 className="progress-title">Tu progreso</h4>
              <div className="progress-stats">
                <div className="progress-item">
                  <span className="progress-label">CVs procesados</span>
                  <span className="progress-value">{dashboardData.total_cvs || 0}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Entrevistas</span>
                  <span className="progress-value">{dashboardData.total_entrevistas || 0}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Informes</span>
                  <span className="progress-value">{dashboardData.total_informes || 0}</span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              {dashboardData.progreso_analisis > 0 && (
                <div className="progress-bar-wrapper" style={{ marginTop: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Progreso de análisis</span>
                    <span>{dashboardData.progreso_analisis}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dashboardData.progreso_analisis}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="progress-section" 
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="progress-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '1rem'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%'
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  Cargando tus estadísticas...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default Welcome;