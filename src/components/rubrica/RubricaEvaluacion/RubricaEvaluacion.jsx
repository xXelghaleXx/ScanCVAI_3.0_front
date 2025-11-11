// src/components/rubrica/RubricaEvaluacion/RubricaEvaluacion.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Info, ArrowLeft, FileText, MessageCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext/ThemeContext';
import Background from '../../layout/Background/Background';
import '../../../styles/components/rubrica/RubricaEvaluacion.css';

const RubricaEvaluacion = ({ embedded = false, onClose = null }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedCriterio, setSelectedCriterio] = useState(null);

  // Datos de la rúbrica
  const rubrica = {
    titulo: 'Rubrica de Evaluacion de CV y Certificados',
    criterios: [
      {
        id: 1,
        nombre: 'Perfil Profesional',
        peso: 15,
        niveles: {
          excelente: {
            rango: '13-15 pts',
            descripcion: '4-5 líneas perfectas con marca personal y valor añadido'
          },
          bueno: {
            rango: '10-12 pts',
            descripcion: 'Estructura correcta, falta refinamiento menor'
          },
          regular: {
            rango: '7-9 pts',
            descripcion: 'Muy extenso/corto, información irrelevante'
          },
          deficiente: {
            rango: '0-6 pts',
            descripcion: 'No existe o errores graves'
          }
        }
      },
      {
        id: 2,
        nombre: 'Formato TECSUP',
        peso: 20,
        niveles: {
          excelente: {
            rango: '18-20 pts',
            descripcion: 'Formato perfecto, tipografía correcta, bien organizado'
          },
          bueno: {
            rango: '14-17 pts',
            descripcion: 'Sigue formato con errores menores'
          },
          regular: {
            rango: '10-13 pts',
            descripcion: 'Faltan secciones importantes'
          },
          deficiente: {
            rango: '0-9 pts',
            descripcion: 'No sigue formato institucional'
          }
        }
      },
      {
        id: 3,
        nombre: 'Experiencia Académica',
        peso: 20,
        niveles: {
          excelente: {
            rango: '18-20 pts',
            descripcion: '3+ proyectos detallados con resultados cuantificables'
          },
          bueno: {
            rango: '14-17 pts',
            descripcion: '2 proyectos bien documentados'
          },
          regular: {
            rango: '10-13 pts',
            descripcion: '1-2 proyectos sin suficiente detalle'
          },
          deficiente: {
            rango: '0-9 pts',
            descripcion: 'No presenta proyectos académicos'
          }
        }
      },
      {
        id: 4,
        nombre: 'Experiencia Laboral',
        peso: 20,
        niveles: {
          excelente: {
            rango: '13-15 pts',
            descripcion: 'Experiencia relevante con logros cuantificables'
          },
          bueno: {
            rango: '10-12 pts',
            descripcion: 'Prácticas o trabajos de medio tiempo'
          },
          regular: {
            rango: '7-9 pts',
            descripcion: 'Experiencia no relacionada a la carrera'
          },
          deficiente: {
            rango: '0-6 pts',
            descripcion: 'Sin experiencia laboral relevante'
          }
        }
      },
      {
        id: 5,
        nombre: 'Certificaciones',
        peso: 15,
        niveles: {
          excelente: {
            rango: '13-15 pts',
            descripcion: '3+ certificaciones validadas y relevantes'
          },
          bueno: {
            rango: '10-12 pts',
            descripcion: '2 certificaciones validadas'
          },
          regular: {
            rango: '7-9 pts',
            descripcion: '1 certificación validada'
          },
          deficiente: {
            rango: '0-6 pts',
            descripcion: 'Sin certificaciones validadas'
          }
        }
      },
      {
        id: 6,
        nombre: 'Informacion Adicional',
        peso: 15,
        niveles: {
          excelente: {
            rango: '13-15 pts',
            descripcion: 'Idiomas, voluntariado, liderazgo, desarrollo continuo'
          },
          bueno: {
            rango: '10-12 pts',
            descripcion: '2+ elementos adicionales relevantes'
          },
          regular: {
            rango: '7-9 pts',
            descripcion: '1 elemento adicional básico'
          },
          deficiente: {
            rango: '0-6 pts',
            descripcion: 'Sección vacía o irrelevante'
          }
        }
      }
    ],
    totalPuntos: 100,
    niveles_desempenio: {
      excelente: { min: 90, max: 100, color: '#10b981' },
      bueno: { min: 75, max: 89, color: '#3b82f6' },
      regular: { min: 60, max: 74, color: '#f59e0b' },
      deficiente: { min: 0, max: 59, color: '#ef4444' }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const getNivelColor = (nivel) => {
    const colors = {
      excelente: '#10b981',
      bueno: '#3b82f6',
      regular: '#f59e0b',
      deficiente: '#ef4444'
    };
    return colors[nivel] || '#6b7280';
  };

  if (embedded) {
    return (
      <div className="rubrica-embedded">
        <div className="rubrica-header-embedded">
          <div className="rubrica-title-section">
            <Award size={28} className="rubrica-icon" />
            <h2>{rubrica.titulo}</h2>
          </div>
        </div>

        <div className="rubrica-table-container">
          <table className="rubrica-table">
            <thead>
              <tr>
                <th className="criterio-column">Criterio</th>
                <th className="nivel-column excelente">Excelente</th>
                <th className="nivel-column bueno">Bueno</th>
                <th className="nivel-column regular">Regular</th>
                <th className="nivel-column deficiente">Deficiente</th>
              </tr>
            </thead>
            <tbody>
              {rubrica.criterios.map((criterio) => (
                <tr key={criterio.id} className="criterio-row">
                  <td className="criterio-cell">
                    <div className="criterio-nombre">{criterio.nombre}</div>
                    <div className="criterio-peso">{criterio.peso}</div>
                  </td>
                  <td className="nivel-cell excelente">
                    <div className="nivel-rango">{criterio.niveles.excelente.rango}</div>
                    <div className="nivel-descripcion">{criterio.niveles.excelente.descripcion}</div>
                  </td>
                  <td className="nivel-cell bueno">
                    <div className="nivel-rango">{criterio.niveles.bueno.rango}</div>
                    <div className="nivel-descripcion">{criterio.niveles.bueno.descripcion}</div>
                  </td>
                  <td className="nivel-cell regular">
                    <div className="nivel-rango">{criterio.niveles.regular.rango}</div>
                    <div className="nivel-descripcion">{criterio.niveles.regular.descripcion}</div>
                  </td>
                  <td className="nivel-cell deficiente">
                    <div className="nivel-rango">{criterio.niveles.deficiente.rango}</div>
                    <div className="nivel-descripcion">{criterio.niveles.deficiente.descripcion}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rubrica-footer-embedded">
          <div className="rubrica-info">
            <Info size={18} />
            <span>Total: {rubrica.totalPuntos} puntos</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Background />
      <div className="rubrica-page-container">
        <motion.div
          className="rubrica-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="rubrica-header">
            <button onClick={handleClose} className="rubrica-back-btn">
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className="rubrica-title-section">
              <Award size={32} className="rubrica-icon" />
              <div>
                <h1>{rubrica.titulo}</h1>
                <p>Criterios de evaluación para CV y certificaciones</p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="rubrica-info-cards">
            <div className="info-card">
              <FileText size={24} />
              <div>
                <h3>Para CV</h3>
                <p>Evaluación de formato, contenido y presentación profesional</p>
              </div>
            </div>
            <div className="info-card">
              <MessageCircle size={24} />
              <div>
                <h3>Para Entrevistas</h3>
                <p>Criterios de comunicación, conocimientos y competencias</p>
              </div>
            </div>
          </div>

          {/* Tabla de rúbrica */}
          <div className="rubrica-table-wrapper">
            <div className="rubrica-table-container">
              <table className="rubrica-table">
                <thead>
                  <tr>
                    <th className="criterio-column">Criterio</th>
                    <th className="nivel-column excelente">Excelente</th>
                    <th className="nivel-column bueno">Bueno</th>
                    <th className="nivel-column regular">Regular</th>
                    <th className="nivel-column deficiente">Deficiente</th>
                  </tr>
                </thead>
                <tbody>
                  {rubrica.criterios.map((criterio) => (
                    <motion.tr
                      key={criterio.id}
                      className={`criterio-row ${selectedCriterio === criterio.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCriterio(selectedCriterio === criterio.id ? null : criterio.id)}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="criterio-cell">
                        <div className="criterio-nombre">{criterio.nombre}</div>
                        <div className="criterio-peso">{criterio.peso}</div>
                      </td>
                      <td className="nivel-cell excelente">
                        <div className="nivel-rango">{criterio.niveles.excelente.rango}</div>
                        <div className="nivel-descripcion">{criterio.niveles.excelente.descripcion}</div>
                      </td>
                      <td className="nivel-cell bueno">
                        <div className="nivel-rango">{criterio.niveles.bueno.rango}</div>
                        <div className="nivel-descripcion">{criterio.niveles.bueno.descripcion}</div>
                      </td>
                      <td className="nivel-cell regular">
                        <div className="nivel-rango">{criterio.niveles.regular.rango}</div>
                        <div className="nivel-descripcion">{criterio.niveles.regular.descripcion}</div>
                      </td>
                      <td className="nivel-cell deficiente">
                        <div className="nivel-rango">{criterio.niveles.deficiente.rango}</div>
                        <div className="nivel-descripcion">{criterio.niveles.deficiente.descripcion}</div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Niveles de desempeño */}
          <div className="rubrica-niveles-desempenio">
            <h3>Niveles de Desempeño</h3>
            <div className="niveles-grid">
              {Object.entries(rubrica.niveles_desempenio).map(([nivel, data]) => (
                <div key={nivel} className="nivel-card" style={{ borderColor: data.color }}>
                  <div className="nivel-header" style={{ background: data.color }}>
                    <span className="nivel-nombre">{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</span>
                  </div>
                  <div className="nivel-body">
                    <div className="nivel-rango-desempenio">
                      {data.min} - {data.max} puntos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="rubrica-footer">
            <div className="rubrica-total">
              <Info size={20} />
              <span>Puntuación Total: <strong>{rubrica.totalPuntos} puntos</strong></span>
            </div>
            <p className="rubrica-note">
              Esta rúbrica se utiliza tanto para evaluar CVs como para calificar el desempeño en entrevistas.
              Cada criterio tiene un peso específico que contribuye a la puntuación final.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RubricaEvaluacion;
