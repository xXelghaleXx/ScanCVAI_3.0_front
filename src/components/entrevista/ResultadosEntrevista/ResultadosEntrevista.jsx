// src/components/ResultadosEntrevista.jsx
import { motion } from 'framer-motion';
import Background from '../../layout/Background/Background';
import {
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

const ResultadosEntrevista = ({ resultados, onNuevaEntrevista }) => {
  // Extraer datos del backend
  const puntuacion_general = resultados?.evaluacion?.puntuacion_global || resultados?.puntuacion_general || 0;
  const scoringData = resultados?.evaluacion?.metricas_puntuacion;

  // Determinar nivel (del scoring del backend o fallback)
  const nivel = scoringData?.nivel || {
    nombre: 'Regular',
    color: '#f59e0b',
    descripcion: 'Desempeño satisfactorio'
  };

  const fortalezas = resultados?.evaluacion?.fortalezas || resultados?.fortalezas || [];
  const areas_mejora = resultados?.evaluacion?.areas_mejora || resultados?.areas_mejora || [];
  const comentario_final = resultados?.evaluacion?.comentario_final || resultados?.comentario_final || '';
  const carrera = resultados?.estadisticas?.carrera || resultados?.carrera || '';
  const fecha_entrevista = resultados?.fecha_completada
    ? new Date(resultados.fecha_completada).toLocaleDateString()
    : new Date().toLocaleDateString();
  const totalPreguntas = scoringData?.totalPreguntas || resultados?.estadisticas?.mensajes_usuario || 0;

  const obtenerColorPuntuacion = (puntuacion) => {
    if (puntuacion >= 80) return '#10b981';
    if (puntuacion >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const renderEstrellas = (puntuacion) => {
    const estrellas = Math.round(puntuacion / 20);
    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={i < estrellas ? '#fbbf24' : 'none'}
              stroke={i < estrellas ? '#fbbf24' : '#d1d5db'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.div>
        ))}
      </div>
    );
  };

  const formatearAreaMejora = (area) => {
    // Si es string simple, retornar como objeto
    if (typeof area === 'string') {
      return {
        titulo: area,
        descripcion: '',
        recomendacion: ''
      };
    }
    // Si ya es objeto, retornarlo
    return area;
  };

  const formatearFortaleza = (fortaleza) => {
    // Si es string simple, retornar como objeto
    if (typeof fortaleza === 'string') {
      return {
        titulo: fortaleza,
        descripcion: ''
      };
    }
    // Si ya es objeto, retornarlo
    return fortaleza;
  };

  return (
    <>
      <Background />
      <div style={{
        minHeight: '100vh',
        padding: '2rem 1rem',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <Award size={64} color="#667eea" />
          </motion.div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            ¡Entrevista Completada!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: 0 }}>
            <strong style={{ color: '#667eea' }}>{carrera}</strong>
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {fecha_entrevista}
          </p>
        </motion.div>

        {/* Puntuación General */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            justifyContent: 'center'
          }}>
            <Target size={24} color="#667eea" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Puntuación General
            </h2>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            style={{
              fontSize: '5rem',
              fontWeight: 800,
              color: obtenerColorPuntuacion(puntuacion_general),
              marginBottom: '1rem'
            }}
          >
            {puntuacion_general}
            <span style={{ fontSize: '2.5rem', color: '#9ca3af' }}>/100</span>
          </motion.div>

          <div style={{ marginBottom: '1rem' }}>
            {renderEstrellas(puntuacion_general)}
          </div>

          <div style={{
            width: '100%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${puntuacion_general}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${obtenerColorPuntuacion(puntuacion_general)}, ${obtenerColorPuntuacion(puntuacion_general)}dd)`,
                borderRadius: '999px'
              }}
            />
          </div>

          <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
            {puntuacion_general >= 90 && '¡Excelente! Desempeño sobresaliente 🎉'}
            {puntuacion_general >= 80 && puntuacion_general < 90 && '¡Muy bien! Excelente trabajo 🌟'}
            {puntuacion_general >= 70 && puntuacion_general < 80 && 'Buen desempeño, sigue así 👍'}
            {puntuacion_general >= 60 && puntuacion_general < 70 && 'Desempeño satisfactorio 📈'}
            {puntuacion_general < 60 && 'Hay potencial por desarrollar 💪'}
          </p>
        </motion.div>


        {/* Fortalezas */}
        {fortalezas && fortalezas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '2.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <CheckCircle size={24} color="#10b981" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Fortalezas Destacadas
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fortalezas.slice(0, 3).map((fortaleza, index) => {
                const fortalezaObj = formatearFortaleza(fortaleza);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    style={{
                      padding: '1rem',
                      background: '#ecfdf5',
                      border: '2px solid #d1fae5',
                      borderRadius: '12px',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {fortalezaObj.titulo}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Detalles del Scoring */}
        {scoringData?.completado && scoringData.detalles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '2.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <BarChart3 size={24} color="#667eea" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Detalles del Scoring
              </h2>
            </div>

            {/* Métricas Individuales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Comunicación */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                    💬 Comunicación
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: obtenerColorPuntuacion(scoringData.detalles.comunicacion) }}>
                    {scoringData.detalles.comunicacion}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoringData.detalles.comunicacion}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                      height: '100%',
                      background: obtenerColorPuntuacion(scoringData.detalles.comunicacion),
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>

              {/* Conocimiento Técnico */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                    🔧 Conocimiento Técnico
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: obtenerColorPuntuacion(scoringData.detalles.conocimientoTecnico) }}>
                    {scoringData.detalles.conocimientoTecnico}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoringData.detalles.conocimientoTecnico}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{
                      height: '100%',
                      background: obtenerColorPuntuacion(scoringData.detalles.conocimientoTecnico),
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>

              {/* Competencias */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                    🎯 Competencias Blandas
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: obtenerColorPuntuacion(scoringData.detalles.competencias) }}>
                    {scoringData.detalles.competencias}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoringData.detalles.competencias}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    style={{
                      height: '100%',
                      background: obtenerColorPuntuacion(scoringData.detalles.competencias),
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>

              {/* Completitud */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                    ✅ Completitud
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: obtenerColorPuntuacion(scoringData.detalles.completitud) }}>
                    {scoringData.detalles.completitud}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoringData.detalles.completitud}%` }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    style={{
                      height: '100%',
                      background: obtenerColorPuntuacion(scoringData.detalles.completitud),
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>

              {/* Coherencia */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
                    🔗 Coherencia
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: obtenerColorPuntuacion(scoringData.detalles.coherencia) }}>
                    {scoringData.detalles.coherencia}/100
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoringData.detalles.coherencia}%` }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    style={{
                      height: '100%',
                      background: obtenerColorPuntuacion(scoringData.detalles.coherencia),
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Nivel y Estadísticas */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: `linear-gradient(135deg, ${nivel.color}15, ${nivel.color}05)`,
              border: `2px solid ${nivel.color}30`,
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Nivel Alcanzado
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: nivel.color, margin: 0 }}>
                    {nivel.nombre}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Preguntas Respondidas
                  </p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {totalPreguntas} preguntas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Áreas de Mejora */}
        {areas_mejora && areas_mejora.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '2.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <TrendingUp size={24} color="#f59e0b" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Recomendaciones de Mejora
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {areas_mejora.slice(0, 5).map((area, index) => {
                const areaObj = formatearAreaMejora(area);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    style={{
                      padding: '1rem',
                      background: '#fffbeb',
                      border: '2px solid #fef3c7',
                      borderRadius: '12px',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start'
                    }}
                  >
                    <TrendingUp size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#111827',
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {areaObj.titulo}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Análisis de la IA */}
        {comentario_final && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.3)',
              padding: '2.5rem',
              marginBottom: '1.5rem',
              color: 'white'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🤖
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>
                Análisis del Entrevistador
              </h2>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.8,
                margin: 0,
                whiteSpace: 'pre-line',
                fontSize: '0.9375rem'
              }}>
                {comentario_final}
              </p>
            </div>
          </motion.div>
        )}

        {/* Botón de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={onNuevaEntrevista}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }}
          >
            <RefreshCw size={22} />
            Nueva Entrevista
          </button>
        </motion.div>

        </div>
      </div>
    </>
  );
};

export default ResultadosEntrevista;
