// src/components/CarreraSelector.jsx - VERSIÓN OPTIMIZADA
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, ChevronRight, CheckCircle, Zap, Award, Flame, MessageCircle, Mic } from 'lucide-react';
import authService from '../../../services/auth.service';
import entrevistaService from '../../../services/entrevista.service';
import { toast } from 'react-toastify';

const CarreraSelector = ({ onEntrevistaIniciada, onCancel }) => {
  const [paso, setPaso] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedDificultad, setSelectedDificultad] = useState(null);
  const [selectedModalidad, setSelectedModalidad] = useState(null);
  const [selectedVoz, setSelectedVoz] = useState('Microsoft Helena - Spanish (Spain)'); // Voz por defecto
  const [iniciandoEntrevista, setIniciandoEntrevista] = useState(false);
  const [error, setError] = useState(null);

  const dificultades = [
    {
      id: 'basica',
      nombre: 'Básica',
      descripcion: 'Preguntas básicas y fundamentales',
      icon: Zap,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'intermedia',
      nombre: 'Intermedia',
      descripcion: 'Preguntas de nivel medio con casos prácticos',
      icon: Award,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'avanzada',
      nombre: 'Avanzada',
      descripcion: 'Preguntas complejas y desafiantes',
      icon: Flame,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    }
  ];

  const modalidades = [
    {
      id: 'chat',
      nombre: 'Chat',
      descripcion: 'Entrevista mediante texto escrito',
      icon: MessageCircle,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      id: 'voz',
      nombre: 'Voz',
      descripcion: 'Entrevista hablada con IA de voz',
      icon: Mic,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  const voces = [
    { id: 'Microsoft Helena - Spanish (Spain)', nombre: 'Helena', descripcion: 'Voz femenina española (Microsoft)' },
    { id: 'Microsoft Pablo - Spanish (Spain)', nombre: 'Pablo', descripcion: 'Voz masculina española (Microsoft)' },
    { id: 'Microsoft Sabina - Spanish (Mexico)', nombre: 'Sabina', descripcion: 'Voz femenina mexicana (Microsoft)' },
    { id: 'Microsoft Raul - Spanish (Mexico)', nombre: 'Raúl', descripcion: 'Voz masculina mexicana (Microsoft)' }
  ];

  useEffect(() => {
    cargarCarreras();
  }, []);

  const cargarCarreras = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Carreras] Cargando carreras...');

      const result = await authService.getCarreras();

      if (result.success) {
        console.log('[Carreras] Carreras cargadas:', result.carreras.length);
        setCarreras(result.carreras || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[Carreras] Error cargando carreras:', error);
      setError('Error al cargar las carreras');
      toast.error('Error al cargar las carreras');
    } finally {
      setLoading(false);
    }
  };

  const carrerasFiltradas = carreras.filter(carrera =>
    carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCarrera = (carrera) => {
    console.log('[Selector] Carrera seleccionada:', carrera.nombre);
    setSelectedCarrera(carrera);
    setError(null);
  };

  const handleSelectDificultad = (dificultad) => {
    console.log('[Selector] Dificultad seleccionada:', dificultad.nombre);
    setSelectedDificultad(dificultad);
    setError(null);
  };

  const handleSelectModalidad = (modalidad) => {
    console.log('[Selector] Modalidad seleccionada:', modalidad.nombre);
    setSelectedModalidad(modalidad);
    setError(null);
  };

  const handleContinuarADificultad = () => {
    if (selectedCarrera) {
      console.log('[Selector] Avanzando a selección de dificultad');
      setPaso(2);
      setError(null);
    }
  };

  const handleContinuarAModalidad = () => {
    if (selectedDificultad) {
      console.log('[Selector] Avanzando a selección de modalidad');
      setPaso(3);
      setError(null);
    }
  };

  const handleVolverACarreras = () => {
    console.log('[Selector] Volviendo a selección de carreras');
    setPaso(1);
    setSelectedDificultad(null);
    setSelectedModalidad(null);
    setError(null);
  };

  const handleVolverADificultad = () => {
    console.log('[Selector] Volviendo a selección de dificultad');
    setPaso(2);
    setSelectedModalidad(null);
    setError(null);
  };

  const iniciarEntrevista = async () => {
    if (!selectedCarrera || !selectedDificultad || !selectedModalidad) {
      toast.error('Selecciona una carrera, dificultad y modalidad');
      return;
    }

    try {
      setIniciandoEntrevista(true);
      setError(null);

      console.log('[Entrevista] Iniciando entrevista...');
      console.log('[Entrevista] Carrera:', selectedCarrera.nombre, `(ID: ${selectedCarrera.id})`);
      console.log('[Entrevista] Dificultad:', selectedDificultad.nombre, `(${selectedDificultad.id})`);
      console.log('[Entrevista] Modalidad:', selectedModalidad.nombre, `(${selectedModalidad.id})`);
      if (selectedModalidad.id === 'voz') {
        console.log('[Entrevista] Voz seleccionada:', selectedVoz);
      }

      const result = await entrevistaService.iniciarEntrevista(
        selectedCarrera.id,
        selectedDificultad.id,
        selectedModalidad.id
      );

      if (result.success) {
        console.log('[Entrevista] Entrevista iniciada exitosamente');
        console.log('[Entrevista] ID:', result.data.entrevistaId);
        console.log('[Entrevista] Mensaje inicial:', result.data.mensajeInicial.substring(0, 50) + '...');

        toast.success(`Entrevista iniciada: ${selectedCarrera.nombre}`);

        onEntrevistaIniciada({
          entrevistaId: result.data.entrevistaId,
          carrera: selectedCarrera,
          dificultad: selectedDificultad,
          modalidad: selectedModalidad,
          mensajeInicial: result.data.mensajeInicial,
          aiDisponible: result.data.aiDisponible,
          vozSeleccionada: selectedModalidad.id === 'voz' ? selectedVoz : null
        });

      } else {
        if (result.entrevistaActiva) {
          const confirmar = window.confirm(
            `Ya tienes una entrevista activa de ${result.entrevistaActiva.carrera_id || 'una carrera'}.\n\n` +
            `¿Deseas abandonarla e iniciar una nueva?`
          );

          if (confirmar) {
            const abandonResult = await entrevistaService.abandonarEntrevista(
              result.entrevistaActiva.id
            );

            if (abandonResult.success) {
              toast.info('Entrevista anterior abandonada. Iniciando nueva...');
              setTimeout(() => iniciarEntrevista(), 500);
            } else {
              throw new Error('Error al abandonar entrevista anterior');
            }
          }
          return;
        }

        throw new Error(result.error);
      }

    } catch (error) {
      console.error('[Entrevista] Error al iniciar entrevista:', error);
      setError(error.message || 'Error al iniciar la entrevista');
      toast.error(error.message || 'Error al iniciar la entrevista');
    } finally {
      setIniciandoEntrevista(false);
    }
  };

  return (
    <motion.div
      className="selector-carreras-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <motion.div
        className="selector-carreras-modal"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid #e5e7eb',
          background: paso === 1
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : paso === 2
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {paso === 1 ? (
              <Briefcase size={32} color="white" />
            ) : paso === 2 ? (
              <Flame size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>
              {paso === 1 ? 'Selecciona una Carrera' : paso === 2 ? 'Selecciona la Dificultad' : 'Selecciona la Modalidad'}
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>
            {paso === 1
              ? 'Elige la carrera para la cual deseas practicar tu entrevista'
              : paso === 2
                ? `Carrera seleccionada: ${selectedCarrera?.nombre}`
                : `Dificultad: ${selectedDificultad?.nombre}`
            }
          </p>

          {/* Indicador de Pasos - Simplificado */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'white',
              transition: 'all 0.3s ease'
            }} />
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: paso >= 2 ? 'white' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }} />
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: paso === 3 ? 'white' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }} />
          </div>
        </div>

        {/* Contenido */}
        <AnimatePresence mode="wait">
          {paso === 1 ? (
            <motion.div
              key="paso1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              {/* Buscador */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: '#9ca3af'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar carrera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Lista de Carreras - Sin animaciones individuales */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#6b7280' }}>Cargando carreras...</p>
                  </div>
                ) : carrerasFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Briefcase size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>No se encontraron carreras</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {carrerasFiltradas.map((carrera) => (
                      <div
                        key={carrera.id}
                        onClick={() => handleSelectCarrera(carrera)}
                        style={{
                          padding: '1rem 1.5rem',
                          border: selectedCarrera?.id === carrera.id
                            ? '2px solid #667eea'
                            : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: selectedCarrera?.id === carrera.id
                            ? 'rgba(102, 126, 234, 0.05)'
                            : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          transform: 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.01)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.25rem'
                          }}>
                            {carrera.nombre.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              margin: 0,
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: '#111827'
                            }}>
                              {carrera.nombre}
                            </h3>
                            {carrera.area && (
                              <p style={{
                                margin: '0.25rem 0 0 0',
                                fontSize: '0.75rem',
                                color: '#6b7280'
                              }}>
                                {carrera.area}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedCarrera?.id === carrera.id ? (
                          <CheckCircle size={24} color="#667eea" />
                        ) : (
                          <ChevronRight size={20} color="#d1d5db" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : paso === 2 ? (
            <motion.div
              key="paso2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dificultades.map((dificultad) => {
                  const Icon = dificultad.icon;
                  return (
                    <div
                      key={dificultad.id}
                      onClick={() => handleSelectDificultad(dificultad)}
                      style={{
                        padding: '1.5rem',
                        border: selectedDificultad?.id === dificultad.id
                          ? `2px solid ${dificultad.color}`
                          : '2px solid #e5e7eb',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        background: selectedDificultad?.id === dificultad.id
                          ? `${dificultad.color}10`
                          : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        transition: 'all 0.2s ease',
                        transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '14px',
                        background: dificultad.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={32} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#111827'
                        }}>
                          {dificultad.nombre}
                        </h3>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {dificultad.descripcion}
                        </p>
                      </div>
                      {selectedDificultad?.id === dificultad.id && (
                        <CheckCircle size={28} color={dificultad.color} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="paso3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {modalidades.map((modalidad) => {
                  const Icon = modalidad.icon;
                  return (
                    <div
                      key={modalidad.id}
                      onClick={() => handleSelectModalidad(modalidad)}
                      style={{
                        padding: '1.5rem',
                        border: selectedModalidad?.id === modalidad.id
                          ? `2px solid ${modalidad.color}`
                          : '2px solid #e5e7eb',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        background: selectedModalidad?.id === modalidad.id
                          ? `${modalidad.color}10`
                          : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        transition: 'all 0.2s ease',
                        transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '14px',
                        background: modalidad.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={32} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#111827'
                        }}>
                          {modalidad.nombre}
                        </h3>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {modalidad.descripcion}
                        </p>
                      </div>
                      {selectedModalidad?.id === modalidad.id && (
                        <CheckCircle size={28} color={modalidad.color} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selector de Voz - Solo visible cuando modalidad es 'voz' */}
              {selectedModalidad?.id === 'voz' && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    Selecciona la Voz del Entrevistador
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {voces.map((voz) => (
                      <div
                        key={voz.id}
                        onClick={() => setSelectedVoz(voz.id)}
                        style={{
                          padding: '1rem',
                          background: selectedVoz === voz.id ? '#eff6ff' : 'white',
                          border: `2px solid ${selectedVoz === voz.id ? '#2b7de9' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <h4 style={{
                            margin: '0 0 0.25rem 0',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: selectedVoz === voz.id ? '#2b7de9' : '#1f2937'
                          }}>
                            {voz.nombre}
                          </h4>
                          <p style={{
                            margin: '0',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                          }}>
                            {voz.descripcion}
                          </p>
                        </div>
                        {selectedVoz === voz.id && (
                          <CheckCircle size={24} color="#2b7de9" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje de Error */}
              {error && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    color: '#dc2626',
                    fontSize: '0.875rem'
                  }}
                >
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          background: '#f9fafb'
        }}>
          <button
            onClick={paso === 1 ? onCancel : paso === 2 ? handleVolverACarreras : handleVolverADificultad}
            disabled={iniciandoEntrevista}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              color: '#6b7280',
              fontWeight: 600,
              cursor: iniciandoEntrevista ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontFamily: 'inherit',
              opacity: iniciandoEntrevista ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !iniciandoEntrevista && (e.target.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.target.style.background = 'white')}
          >
            {paso === 1 ? 'Cancelar' : 'Volver'}
          </button>

          {paso === 1 ? (
            <button
              onClick={handleContinuarADificultad}
              disabled={!selectedCarrera}
              style={{
                flex: 2,
                padding: '0.875rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: selectedCarrera
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#e5e7eb',
                color: 'white',
                fontWeight: 600,
                cursor: selectedCarrera ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: selectedCarrera ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => selectedCarrera && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              Continuar
              <ChevronRight size={20} />
            </button>
          ) : paso === 2 ? (
            <button
              onClick={handleContinuarAModalidad}
              disabled={!selectedDificultad}
              style={{
                flex: 2,
                padding: '0.875rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: selectedDificultad
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : '#e5e7eb',
                color: 'white',
                fontWeight: 600,
                cursor: selectedDificultad ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: selectedDificultad ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => selectedDificultad && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              Continuar
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={iniciarEntrevista}
              disabled={!selectedModalidad || iniciandoEntrevista}
              style={{
                flex: 2,
                padding: '0.875rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: selectedModalidad && !iniciandoEntrevista
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#e5e7eb',
                color: 'white',
                fontWeight: 600,
                cursor: (selectedModalidad && !iniciandoEntrevista) ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: (selectedDificultad && !iniciandoEntrevista) ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => selectedDificultad && !iniciandoEntrevista && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              {iniciandoEntrevista ? (
                <>Iniciando...</>
              ) : (
                <>
                  Iniciar Entrevista
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CarreraSelector;
