// src/components/guia/GuiaUsuario/GuiaUsuario.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Upload, FileText, MessageCircle, Award, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext/ThemeContext';
import Background from '../../layout/Background/Background';
import '../../../styles/components/guia/GuiaUsuario.css';

const GuiaUsuario = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);

  const handleClose = () => {
    navigate(-1);
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const guiaSections = [
    {
      id: 1,
      title: 'Lector de CV',
      icon: <Upload size={24} />,
      color: '#3b82f6',
      steps: [
        'Haz clic en "Lector de CV" en el menú principal',
        'Selecciona tu archivo CV en formato PDF, DOC o DOCX',
        'Haz clic en "Subir CV" para iniciar el análisis',
        'Espera mientras la IA analiza tu CV (puede tomar unos segundos)',
        'Revisa el informe detallado con puntuación, fortalezas y áreas de mejora',
        'Descarga el informe en PDF o guárdalo en tu historial'
      ],
      tips: [
        'Asegúrate de que tu CV esté actualizado antes de subirlo',
        'El formato debe cumplir con los estándares de Tecsup',
        'Revisa que toda la información sea legible y esté bien estructurada'
      ]
    },
    {
      id: 2,
      title: 'Simulación de Entrevista',
      icon: <MessageCircle size={24} />,
      color: '#10b981',
      steps: [
        'Accede a "Simulación de entrevista" desde el menú',
        'Selecciona el tipo de entrevista que deseas practicar',
        'Lee cuidadosamente cada pregunta que te presente el sistema',
        'Responde de forma clara y profesional en el campo de texto',
        'Envía tu respuesta y espera el feedback de la IA',
        'Continúa con las siguientes preguntas hasta completar la entrevista',
        'Al finalizar, revisa tu puntuación y recomendaciones'
      ],
      tips: [
        'Practica con diferentes tipos de entrevistas para mejorar',
        'Responde con ejemplos concretos de tu experiencia',
        'Mantén un tono profesional y estructurado en tus respuestas'
      ]
    },
    {
      id: 3,
      title: 'Historial de CVs',
      icon: <History size={24} />,
      color: '#f59e0b',
      steps: [
        'Ve a "Historial CV" en el menú lateral',
        'Revisa la lista de todos tus CVs analizados',
        'Haz clic en cualquier CV para ver su informe completo',
        'Compara diferentes versiones para ver tu progreso',
        'Descarga informes anteriores cuando los necesites',
        'Elimina CVs antiguos si ya no los necesitas'
      ],
      tips: [
        'Guarda diferentes versiones de tu CV para diferentes empleos',
        'Revisa tu progreso comparando puntuaciones anteriores',
        'Descarga los informes antes de eliminar un CV'
      ]
    },
    {
      id: 4,
      title: 'Rúbrica de Evaluación',
      icon: <Award size={24} />,
      color: '#8b5cf6',
      steps: [
        'Accede a "Rúbrica de Evaluación" desde el menú',
        'Revisa los 6 criterios de evaluación principales',
        'Entiende qué se califica en cada sección (Perfil, Formato, Experiencia, etc.)',
        'Conoce los rangos de puntuación para cada nivel (Excelente, Bueno, Regular, Deficiente)',
        'Usa esta información para mejorar tu CV antes de subirlo'
      ],
      tips: [
        'Consulta la rúbrica antes de preparar tu CV',
        'Enfócate en los criterios con mayor peso (20 puntos)',
        'Asegúrate de cumplir con el formato institucional de Tecsup'
      ]
    }
  ];

  return (
    <>
      <Background />
      <div className="guia-page-container">
        <div className="guia-container">
          {/* Header */}
          <div className="guia-header">
            <button onClick={handleClose} className="guia-back-btn">
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className="guia-title-section">
              <BookOpen size={32} className="guia-icon" />
              <div>
                <h1>Guía de Usuario</h1>
                <p>Aprende a usar todas las funcionalidades de ScanCVAI</p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div className="guia-intro">
            <h2>Bienvenido a ScanCVAI</h2>
            <p>
              ScanCVAI es una plataforma diseñada para ayudarte a mejorar tu CV y prepararte para entrevistas laborales.
              Utiliza inteligencia artificial para analizar tus documentos y brindarte retroalimentación personalizada.
            </p>
          </div>

          {/* Sections */}
          <div className="guia-sections">
            {guiaSections.map((section) => (
              <div key={section.id} className="guia-section-card">
                <div
                  className="guia-section-header"
                  style={{ borderLeftColor: section.color }}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="guia-section-title">
                    <div className="guia-section-icon" style={{ color: section.color }}>
                      {section.icon}
                    </div>
                    <h3>{section.title}</h3>
                  </div>
                  <div className="guia-section-toggle">
                    {expandedSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedSection === section.id && (
                  <div className="guia-section-content">
                    <div className="guia-steps">
                      <h4>Pasos a seguir:</h4>
                      <ol>
                        {section.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="guia-tips">
                      <h4>Consejos:</h4>
                      <ul>
                        {section.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="guia-footer">
            <p>
              ¿Tienes más preguntas? Contacta al equipo de soporte de Tecsup para asistencia adicional.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuiaUsuario;
