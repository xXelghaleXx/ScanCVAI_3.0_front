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
    const [vistaActual, setVistaActual] = useState('cv'); // 'cv' o 'entrevista'

    // Datos de la rúbrica REAL del sistema (desde rubrica-evaluation.service.js)
    const rubrica = {
        titulo: 'Rúbrica de Evaluación Oficial TECSUP',
        descripcion: 'Sistema de evaluación utilizado por la IA para analizar CVs y entrevistas',

        criterios: [
            {
                id: 1,
                nombre: 'Perfil Profesional',
                peso: 15,
                descripcion_cv: 'Claridad y concisión del resumen profesional, objetivos de carrera y propuesta de valor',
                descripcion_entrevista: 'Comunicación y Presentación - Claridad, estructura y coherencia en las respuestas',
                niveles: {
                    excelente: {
                        rango: '13-15',
                        descripcion: '4-5 líneas perfectas con marca personal y valor añadido'
                    },
                    bueno: {
                        rango: '10-12',
                        descripcion: 'Estructura correcta, falta refinamiento menor'
                    },
                    regular: {
                        rango: '7-9',
                        descripcion: 'Muy extenso/corto, información irrelevante'
                    },
                    deficiente: {
                        rango: '0-6',
                        descripcion: 'No existe o errores graves'
                    }
                }
            },
            {
                id: 2,
                nombre: 'Formato TECSUP',
                peso: 20,
                descripcion_cv: 'Cumplimiento del formato institucional, estructura, organización y presentación visual',
                descripcion_entrevista: 'Estructura de Respuestas - Uso de conectores lógicos y organización del discurso',
                niveles: {
                    excelente: {
                        rango: '18-20',
                        descripcion: 'Formato perfecto, tipografía correcta, bien organizado'
                    },
                    bueno: {
                        rango: '14-17',
                        descripcion: 'Sigue formato con errores menores'
                    },
                    regular: {
                        rango: '10-13',
                        descripcion: 'Faltan secciones importantes'
                    },
                    deficiente: {
                        rango: '0-9',
                        descripcion: 'No sigue formato institucional'
                    }
                }
            },
            {
                id: 3,
                nombre: 'Experiencia Académica',
                peso: 20,
                descripcion_cv: 'Educación formal, cursos, especializaciones y logros académicos relevantes',
                descripcion_entrevista: 'Conocimientos Técnicos - Profundidad y precisión en conceptos técnicos',
                niveles: {
                    excelente: {
                        rango: '18-20',
                        descripcion: '3+ proyectos detallados con resultados cuantificables'
                    },
                    bueno: {
                        rango: '14-17',
                        descripcion: '2 proyectos bien documentados'
                    },
                    regular: {
                        rango: '10-13',
                        descripcion: '1-2 proyectos sin suficiente detalle'
                    },
                    deficiente: {
                        rango: '0-9',
                        descripcion: 'No presenta proyectos académicos'
                    }
                }
            },
            {
                id: 4,
                nombre: 'Experiencia Laboral',
                peso: 20,
                descripcion_cv: 'Relevancia, descripción de responsabilidades, logros cuantificables y progresión profesional',
                descripcion_entrevista: 'Ejemplos Prácticos - Uso de experiencias concretas y casos reales',
                niveles: {
                    excelente: {
                        rango: '18-20',
                        descripcion: 'Experiencia relevante con logros cuantificables'
                    },
                    bueno: {
                        rango: '14-17',
                        descripcion: 'Prácticas o trabajos de medio tiempo'
                    },
                    regular: {
                        rango: '10-13',
                        descripcion: 'Experiencia no relacionada a la carrera'
                    },
                    deficiente: {
                        rango: '0-9',
                        descripcion: 'Sin experiencia laboral relevante'
                    }
                }
            },
            {
                id: 5,
                nombre: 'Certificaciones',
                peso: 15,
                descripcion_cv: 'Cantidad, relevancia y vigencia de certificaciones profesionales y técnicas',
                descripcion_entrevista: 'Competencias Demostradas - Habilidades blandas y profesionalismo',
                niveles: {
                    excelente: {
                        rango: '13-15',
                        descripcion: '3+ certificaciones validadas y relevantes'
                    },
                    bueno: {
                        rango: '10-12',
                        descripcion: '2 certificaciones validadas'
                    },
                    regular: {
                        rango: '7-9',
                        descripcion: '1 certificación validada'
                    },
                    deficiente: {
                        rango: '0-6',
                        descripcion: 'Sin certificaciones validadas'
                    }
                }
            },
            {
                id: 6,
                nombre: 'Información Adicional',
                peso: 10,
                descripcion_cv: 'Habilidades técnicas, idiomas, proyectos personales y competencias complementarias',
                descripcion_entrevista: 'Completitud y Coherencia - Cantidad y consistencia de respuestas',
                niveles: {
                    excelente: {
                        rango: '9-10',
                        descripcion: 'Idiomas, voluntariado, liderazgo, desarrollo continuo'
                    },
                    bueno: {
                        rango: '7-8',
                        descripcion: '2+ elementos adicionales relevantes'
                    },
                    regular: {
                        rango: '5-6',
                        descripcion: '1 elemento adicional básico'
                    },
                    deficiente: {
                        rango: '0-4',
                        descripcion: 'Sección vacía o irrelevante'
                    }
                }
            }
        ],

        totalPuntos: 100,

        niveles_desempenio: {
            excelente: { min: 90, max: 100, color: '#10b981', descripcion: 'Desempeño sobresaliente' },
            bueno: { min: 75, max: 89, color: '#2b7de9', descripcion: 'Buen desempeño' },
            regular: { min: 60, max: 74, color: '#8b5cf6', descripcion: 'Desempeño satisfactorio' },
            deficiente: { min: 0, max: 59, color: '#94a3b8', descripcion: 'Requiere desarrollo' }
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
            bueno: '#2b7de9',
            regular: '#8b5cf6',
            deficiente: '#94a3b8'
        };
        return colors[nivel] || '#94a3b8';
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
                                        <div className="criterio-descripcion">
                                            {vistaActual === 'cv' ? criterio.descripcion_cv : criterio.descripcion_entrevista}
                                        </div>
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
                                <p>{rubrica.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs para CV vs Entrevista */}
                    <div className="rubrica-tabs">
                        <button
                            className={`rubrica-tab ${vistaActual === 'cv' ? 'active' : ''}`}
                            onClick={() => setVistaActual('cv')}
                        >
                            <FileText size={20} />
                            <span>Para CVs</span>
                        </button>
                        <button
                            className={`rubrica-tab ${vistaActual === 'entrevista' ? 'active' : ''}`}
                            onClick={() => setVistaActual('entrevista')}
                        >
                            <MessageCircle size={20} />
                            <span>Para Entrevistas</span>
                        </button>
                    </div>

                    {/* Descripción de la vista actual */}
                    <div className="vista-descripcion">
                        {vistaActual === 'cv' ? (
                            <p>
                                <strong>CV de Referencia TECSUP:</strong> Este es el CV ideal con el cual se comparan todos los CVs que subes al sistema.
                                Puedes visualizarlo y descargarlo para usarlo como guía.
                            </p>
                        ) : (
                            <p>
                                <strong>Rúbrica de Evaluación:</strong> Criterios oficiales utilizados para evaluar
                                tu desempeño en entrevistas, analizando comunicación, conocimientos y competencias demostradas.
                            </p>
                        )}
                    </div>

                    {/* Mostrar solo rúbrica si es vista de entrevista */}
                    {vistaActual === 'entrevista' && (
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
                                            <tr key={criterio.id} className="criterio-row">
                                                <td className="criterio-cell">
                                                    <div className="criterio-nombre">{criterio.nombre}</div>
                                                    <div className="criterio-descripcion">
                                                        {criterio.descripcion_entrevista}
                                                    </div>
                                                    <div className="criterio-peso">{criterio.peso} pts</div>
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
                        </div>
                    )}

                    {/* Mostrar solo CV si es vista de CV */}
                    {vistaActual === 'cv' && (
                        <div className="cv-referencia-section">
                            <div className="cv-referencia-header">
                                <FileText size={24} />
                                <div>
                                    <h2>CV de Referencia TECSUP</h2>
                                    <p>Visualiza y descarga el CV ideal que sirve como referencia para el sistema</p>
                                </div>
                            </div>
                            <div className="cv-referencia-viewer">
                                <iframe
                                    src="https://view.officeapps.live.com/op/embed.aspx?src=https://res.cloudinary.com/dww7z8jx5/raw/upload/v1764486374/scancvai/reference/cv_ejemplo_tecsup.docx"
                                    title="CV de Referencia"
                                    style={{ width: '100%', height: '600px', border: '1px solid var(--border)', borderRadius: '8px' }}
                                ></iframe>
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <a
                                        href="https://res.cloudinary.com/dww7z8jx5/raw/upload/v1764486374/scancvai/reference/cv_ejemplo_tecsup.docx"
                                        download="CV_ejemplo_TECSUP.docx"
                                        className="cv-download-btn"
                                    >
                                        <Download size={20} />
                                        Descargar CV de Referencia
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Niveles de desempeño - solo en vista de entrevista */}
                    {vistaActual === 'entrevista' && (
                        <div className="rubrica-niveles-desempenio">
                            <h3>Niveles de Desempeño Global</h3>
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
                                            <div className="nivel-descripcion-desempenio">
                                                {data.descripcion}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="rubrica-footer">
                        <div className="rubrica-total">
                            <Info size={20} />
                            <span>Puntuación Total: <strong>{rubrica.totalPuntos} puntos</strong></span>
                        </div>
                        <p className="rubrica-note">
                            Esta rúbrica oficial de TECSUP se utiliza tanto para evaluar CVs como para calificar el desempeño en entrevistas.
                            Cada criterio tiene un peso específico que contribuye a la puntuación final. La IA analiza tu contenido
                            y lo compara con estos estándares para generar recomendaciones personalizadas.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RubricaEvaluacion;
