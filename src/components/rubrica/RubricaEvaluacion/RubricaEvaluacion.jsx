// src/components/rubrica/RubricaEvaluacion/RubricaEvaluacion.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Info, ArrowLeft, FileText, MessageCircle, Download } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext/ThemeContext';
import Background from '../../layout/Background/Background';
import '../../../styles/components/rubrica/RubricaEvaluacion.css';

const RubricaEvaluacion = ({ embedded = false, onClose = null }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedCriterio, setSelectedCriterio] = useState(null);

  // Datos de la rúbrica (versión minimalista)
  const rubrica = {
    titulo: 'Rubrica de Evaluacion de CV y Certificados',
    criterios: [
      {
        id: 1,
        nombre: 'Perfil Profesional',
        descripcion: 'Se califica la claridad y concisión del resumen profesional, objetivos de carrera y propuesta de valor',
        peso: 15,
        niveles: {
          excelente: { rango: '13-15' },
          bueno: { rango: '10-12' },
          regular: { rango: '7-9' },
          deficiente: { rango: '0-6' }
        }
      },
      {
        id: 2,
        nombre: 'Formato Tecsup',
        descripcion: 'Se califica el cumplimiento del formato institucional, estructura, organización y presentación visual',
        peso: 20,
        niveles: {
          excelente: { rango: '18-20' },
          bueno: { rango: '14-17' },
          regular: { rango: '10-13' },
          deficiente: { rango: '0-9' }
        }
      },
      {
        id: 3,
        nombre: 'Experiencia Académica',
        descripcion: 'Se califica la educación formal, cursos, especializaciones y logros académicos relevantes',
        peso: 20,
        niveles: {
          excelente: { rango: '18-20' },
          bueno: { rango: '14-17' },
          regular: { rango: '10-13' },
          deficiente: { rango: '0-9' }
        }
      },
      {
        id: 4,
        nombre: 'Experiencia Laboral',
        descripcion: 'Se califica la relevancia, descripción de responsabilidades, logros cuantificables y progresión profesional',
        peso: 20,
        niveles: {
          excelente: { rango: '18-20' },
          bueno: { rango: '14-17' },
          regular: { rango: '10-13' },
          deficiente: { rango: '0-9' }
        }
      },
      {
        id: 5,
        nombre: 'Certificaciones',
        descripcion: 'Se califica la cantidad, relevancia y vigencia de certificaciones profesionales y técnicas',
        peso: 15,
        niveles: {
          excelente: { rango: '13-15' },
          bueno: { rango: '10-12' },
          regular: { rango: '7-9' },
          deficiente: { rango: '0-6' }
        }
      },
      {
        id: 6,
        nombre: 'Informacion Adicional',
        descripcion: 'Se califica habilidades técnicas, idiomas, proyectos personales y competencias complementarias',
        peso: 10,
        niveles: {
          excelente: { rango: '9-10' },
          bueno: { rango: '7-8' },
          regular: { rango: '5-6' },
          deficiente: { rango: '0-4' }
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
                    <div className="criterio-descripcion">{criterio.descripcion}</div>
                    <div className="criterio-peso">{criterio.peso} pts</div>
                  </td>
                  <td className="nivel-cell excelente">
                    {criterio.niveles.excelente.rango}
                  </td>
                  <td className="nivel-cell bueno">
                    {criterio.niveles.bueno.rango}
                  </td>
                  <td className="nivel-cell regular">
                    {criterio.niveles.regular.rango}
                  </td>
                  <td className="nivel-cell deficiente">
                    {criterio.niveles.deficiente.rango}
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
        <div className="rubrica-container">
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
                <p>Criterios de evaluación para CV y entrevistas</p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="rubrica-info-cards">
            <div className="info-card">
              <FileText size={24} />
              <div>
                <h3>Para CV</h3>
                <p>Vista previa del CV de referencia TECSUP</p>
              </div>
            </div>
            <div className="info-card">
              <MessageCircle size={24} />
              <div>
                <h3>Para Entrevistas</h3>
                <p>Parámetros del algoritmo de evaluación de IA</p>
              </div>
            </div>
          </div>

          {/* CV de Referencia */}
          <div className="cv-referencia-section">
            <div className="cv-referencia-header">
              <FileText size={24} />
              <div>
                <h2>CV de Referencia TECSUP</h2>
                <p>Este es el CV ideal con el cual se comparan todos los CVs</p>
              </div>
            </div>
            <div className="cv-referencia-viewer">
              <iframe
                src="/api/cv/reference/cv-ejemplo"
                title="CV de Referencia"
                style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}
              ></iframe>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a
                  href="/api/cv/reference/cv-ejemplo"
                  download="CV_ejemplo_TECSUP.docx"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}
                >
                  <Download size={20} />
                  Descargar CV de Referencia
                </a>
              </div>
            </div>
          </div>

          {/* Parámetros del Algoritmo de Evaluación para Entrevistas */}
          <div className="algoritmo-section" style={{ marginTop: '2rem' }}>
            <div className="algoritmo-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MessageCircle size={24} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Parámetros del Algoritmo de Evaluación de Entrevistas</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>Criterios utilizados por la IA para evaluar tu desempeño en la entrevista</p>
              </div>
            </div>

            <div className="algoritmo-criterios" style={{ display: 'grid', gap: '1rem' }}>
              {/* Criterio 1 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>1. Comunicación y Presentación</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>15 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa la claridad, extensión de respuestas y estructura de oraciones. Se analiza el promedio de palabras por respuesta y la coherencia del discurso.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>13-15</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-12</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>7-9</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-6</div>
                  </div>
                </div>
              </div>

              {/* Criterio 2 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>2. Estructura de Respuestas</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>20 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa el uso de conectores lógicos, coherencia y organización de ideas. Se verifica la presencia de palabras como "porque", "entonces", "además", etc.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>18-20</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>14-17</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-13</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-9</div>
                  </div>
                </div>
              </div>

              {/* Criterio 3 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>3. Conocimientos Técnicos</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>20 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa el uso de terminología técnica y profundidad de conocimiento. Se detectan términos como "código", "función", "API", "base de datos", etc.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>18-20</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>14-17</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-13</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-9</div>
                  </div>
                </div>
              </div>

              {/* Criterio 4 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>4. Ejemplos Prácticos</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>20 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa la capacidad de dar ejemplos concretos y experiencias relevantes. Se buscan referencias a proyectos, implementaciones y casos prácticos.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>18-20</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>14-17</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-13</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-9</div>
                  </div>
                </div>
              </div>

              {/* Criterio 5 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>5. Competencias Demostradas</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>15 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa habilidades blandas como trabajo en equipo, liderazgo y resolución de problemas. Se identifican palabras clave relacionadas con competencias profesionales.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>13-15</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-12</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>7-9</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-6</div>
                  </div>
                </div>
              </div>

              {/* Criterio 6 */}
              <div className="criterio-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className="criterio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>6. Completitud y Coherencia</h3>
                  <span className="criterio-peso" style={{ padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>15 pts</span>
                </div>
                <p className="criterio-descripcion" style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Evalúa la cantidad de respuestas y la consistencia en la longitud de las mismas. Se mide el coeficiente de variación para determinar la coherencia global.
                </p>
                <div className="criterio-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  <div className="nivel excelente" style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Excelente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>13-15</div>
                  </div>
                  <div className="nivel bueno" style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: '0.25rem' }}>Bueno</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>10-12</div>
                  </div>
                  <div className="nivel regular" style={{ padding: '0.5rem', background: '#fffbeb', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Regular</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>7-9</div>
                  </div>
                  <div className="nivel deficiente" style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="nivel-nombre" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem' }}>Deficiente</div>
                    <div className="nivel-rango" style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-6</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de puntuación */}
            <div className="algoritmo-resumen" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>Puntuación Total</h4>
                <p className="resumen-valor" style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#667eea' }}>105 puntos</p>
              </div>
              <div className="resumen-niveles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                <div className="resumen-nivel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="nivel-badge excelente" style={{ padding: '0.25rem 0.75rem', background: '#10b981', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Excelente</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>90-105 pts</span>
                </div>
                <div className="resumen-nivel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="nivel-badge bueno" style={{ padding: '0.25rem 0.75rem', background: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Bueno</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>75-89 pts</span>
                </div>
                <div className="resumen-nivel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="nivel-badge regular" style={{ padding: '0.25rem 0.75rem', background: '#f59e0b', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Regular</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>60-74 pts</span>
                </div>
                <div className="resumen-nivel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="nivel-badge deficiente" style={{ padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Deficiente</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>0-59 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="rubrica-footer">
            <div className="rubrica-total">
              <Info size={20} />
              <span>El algoritmo evalúa automáticamente cada respuesta durante la entrevista</span>
            </div>
            <p className="rubrica-note">
              Los parámetros mostrados son utilizados por la IA para analizar tu desempeño en tiempo real.
              Al finalizar la entrevista, recibirás un informe detallado con tu puntuación en cada criterio.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RubricaEvaluacion;
