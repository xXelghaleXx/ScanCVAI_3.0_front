// src/components/ResultadosEntrevista.jsx
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  Download, 
  Share2, 
  RefreshCw, 
  Star, 
  Award, 
  Target
} from 'lucide-react';

const ResultadosEntrevista = ({ resultados, onNuevaEntrevista }) => {
  const {
    puntuacion_general = 0,
    fortalezas = [],
    areas_mejora = [],
    resumen_ia = '',
    habilidades = {},
    carrera = '',
    fecha_entrevista = new Date().toLocaleDateString(),
    tiempo_total = '0 min'
  } = resultados || {};

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
          <Star
            key={i}
            size={24}
            fill={i < estrellas ? '#fbbf24' : 'none'}
            color={i < estrellas ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const descargarPDF = () => {
    alert('Generando PDF... Esta función estará disponible próximamente.');
  };

  const compartirResultados = () => {
    alert('Compartir resultados... Esta función estará disponible próximamente.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
      padding: '2rem 1rem',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
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
            {fecha_entrevista} • Duración: {tiempo_total}
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
            {puntuacion_general >= 80 && '¡Excelente desempeño! 🎉'}
            {puntuacion_general >= 60 && puntuacion_general < 80 && 'Buen desempeño, con áreas de mejora 👍'}
            {puntuacion_general < 60 && 'Hay mucho potencial por desarrollar 💪'}
          </p>
        </motion.div>

        {/* Fortalezas */}
        {fortalezas && fortalezas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {fortalezas.map((fortaleza, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{
                    padding: '1.25rem',
                    background: '#ecfdf5',
                    border: '2px solid #d1fae5',
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>
                        {fortaleza.titulo}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0,
                        lineHeight: 1.6
                      }}>
                        {fortaleza.descripcion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Áreas de Mejora */}
        {areas_mejora && areas_mejora.length > 0 && (
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
              <TrendingUp size={24} color="#f59e0b" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Áreas de Mejora
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {areas_mejora.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  style={{
                    padding: '1.25rem',
                    background: '#fffbeb',
                    border: '2px solid #fef3c7',
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <TrendingUp size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>
                        {area.titulo}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.75rem',
                        lineHeight: 1.6
                      }}>
                        {area.descripcion}
                      </p>
                      {area.recomendacion && (
                        <div style={{
                          padding: '1rem',
                          background: 'white',
                          borderRadius: '12px',
                          border: '1px solid #fef3c7'
                        }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <BookOpen size={16} color="#667eea" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <p style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#667eea',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.25rem'
                              }}>
                                Recomendación
                              </p>
                              <p style={{
                                fontSize: '0.875rem',
                                color: '#374151',
                                margin: 0,
                                lineHeight: 1.5
                              }}>
                                {area.recomendacion}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Habilidades Evaluadas */}
        {Object.keys(habilidades).length > 0 && (
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
              <Star size={24} color="#667eea" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Habilidades Evaluadas
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(habilidades).map(([habilidad, valor], index) => (
                <motion.div
                  key={habilidad}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontWeight: 600,
                      color: '#374151',
                      textTransform: 'capitalize',
                      fontSize: '0.875rem'
                    }}>
                      {habilidad.replace(/_/g, ' ')}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: obtenerColorPuntuacion(valor),
                      fontSize: '1rem'
                    }}>
                      {valor}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '10px',
                    background: '#e5e7eb',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${valor}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${obtenerColorPuntuacion(valor)}, ${obtenerColorPuntuacion(valor)}dd)`,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Análisis de la IA */}
        {resumen_ia && (
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
                Análisis del Entrevistador IA
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
                fontSize: '0.875rem'
              }}>
                {resumen_ia}
              </p>
            </div>
          </motion.div>
        )}

        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <button
            onClick={descargarPDF}
            style={{
              padding: '1rem 1.5rem',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Download size={20} />
            Descargar PDF
          </button>

          <button
            onClick={compartirResultados}
            style={{
              padding: '1rem 1.5rem',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Share2 size={20} />
            Compartir
          </button>

          <button
            onClick={onNuevaEntrevista}
            style={{
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <RefreshCw size={20} />
            Nueva Entrevista
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default ResultadosEntrevista;