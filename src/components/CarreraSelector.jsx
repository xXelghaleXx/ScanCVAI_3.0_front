// src/components/CarreraSelector.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, ChevronRight, CheckCircle, Zap, Award, Trophy, Flame } from 'lucide-react';

const CarreraSelector = ({ onEntrevistaIniciada, onCancel }) => {
  const [paso, setPaso] = useState(1); // 1: Seleccionar carrera, 2: Seleccionar dificultad
  const [searchTerm, setSearchTerm] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedDificultad, setSelectedDificultad] = useState(null);
  const [iniciandoEntrevista, setIniciandoEntrevista] = useState(false);
  const [error, setError] = useState(null);

  const dificultades = [
    {
      id: 'facil', // Sin tilde - exactamente como lo espera el backend
      nombre: 'Fácil',
      descripcion: 'Preguntas básicas y fundamentales',
      icon: Zap,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'intermedia', // Exactamente como lo espera el backend
      nombre: 'Intermedia',
      descripcion: 'Preguntas de nivel medio con casos prácticos',
      icon: Award,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'avanzado', // Exactamente como lo espera el backend
      nombre: 'Avanzado',
      descripcion: 'Preguntas complejas y desafiantes',
      icon: Flame,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    }
  ];

  useEffect(() => {
    cargarCarreras();
  }, []);

  const cargarCarreras = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:3000/api/carreras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCarreras(data.carreras || []);
      }
    } catch (error) {
      console.error('Error cargando carreras:', error);
    } finally {
      setLoading(false);
    }
  };

  const carrerasFiltradas = carreras.filter(carrera =>
    carrera.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCarrera = (carrera) => {
    setSelectedCarrera(carrera);
  };

  const handleSelectDificultad = (dificultad) => {
    setSelectedDificultad(dificultad);
  };

  const handleContinuarADificultad = () => {
    if (selectedCarrera) {
      setPaso(2);
    }
  };

  const handleVolverACarreras = () => {
    setPaso(1);
    setSelectedDificultad(null);
    setError(null);
  };

  const iniciarEntrevista = async () => {
    if (!selectedCarrera || !selectedDificultad) return;

    try {
      setIniciandoEntrevista(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      // Preparar el body según lo que espera el API
      const requestBody = {
        carreraid: selectedCarrera.id,
        dificultad: selectedDificultad.id
      };

      console.log('📤 Enviando request a /api/entrevistas/iniciar:', requestBody);

      const response = await fetch('http://localhost:3000/api/entrevistas/iniciar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);

      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (response.ok) {
        console.log('✅ Entrevista iniciada exitosamente');
        // Llamar al callback con los datos de la entrevista iniciada
        onEntrevistaIniciada({
          entrevista: responseData,
          carrera: selectedCarrera,
          dificultad: selectedDificultad
        });
      } else {
        console.error('❌ Error del servidor:', responseData);
        setError(responseData.message || responseData.error || 'Error al iniciar la entrevista');
      }
    } catch (error) {
      console.error('Error iniciando entrevista:', error);
      setError('Error de conexión. Por favor, intenta de nuevo.');
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
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
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {paso === 1 ? (
              <Briefcase size={32} color="white" />
            ) : (
              <Trophy size={32} color="white" />
            )}
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>
              {paso === 1 ? 'Selecciona una Carrera' : 'Selecciona la Dificultad'}
            </h2>
          </div>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem' }}>
            {paso === 1 
              ? 'Elige la carrera para la cual deseas practicar tu entrevista'
              : `Carrera seleccionada: ${selectedCarrera?.nombre}`
            }
          </p>

          {/* Indicador de Pasos */}
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
              background: 'white'
            }} />
            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: paso === 2 ? 'white' : 'rgba(255, 255, 255, 0.3)'
            }} />
          </div>
        </div>

        {/* Contenido según el paso */}
        <AnimatePresence mode="wait">
          {paso === 1 ? (
            <motion.div
              key="paso1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              {/* Buscador */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
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
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Lista de Carreras */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem'
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#667eea',
                        borderRadius: '50%',
                        margin: '0 auto 1rem'
                      }}
                    />
                    <p style={{ color: '#6b7280' }}>Cargando carreras...</p>
                  </div>
                ) : carrerasFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Briefcase size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      No se encontraron carreras
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {carrerasFiltradas.map((carrera, index) => (
                      <motion.div
                        key={carrera.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectCarrera(carrera)}
                        style={{
                          padding: '1rem 1.5rem',
                          border: selectedCarrera?.id === carrera.id 
                            ? '2px solid #667eea' 
                            : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: selectedCarrera?.id === carrera.id 
                            ? 'rgba(102, 126, 234, 0.05)' 
                            : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                        whileTap={{ scale: 0.98 }}
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
                            {carrera.descripcion && (
                              <p style={{
                                margin: '0.25rem 0 0 0',
                                fontSize: '0.75rem',
                                color: '#6b7280'
                              }}>
                                {carrera.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedCarrera?.id === carrera.id ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle size={24} color="#667eea" />
                          </motion.div>
                        ) : (
                          <ChevronRight size={20} color="#d1d5db" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paso2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                padding: '2rem',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dificultades.map((dificultad, index) => {
                  const Icon = dificultad.icon;
                  return (
                    <motion.div
                      key={dificultad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSelectDificultad(dificultad)}
                      style={{
                        padding: '1.5rem',
                        border: selectedDificultad?.id === dificultad.id 
                          ? `2px solid ${dificultad.color}` 
                          : '2px solid #e5e7eb',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: selectedDificultad?.id === dificultad.id 
                          ? `${dificultad.color}10` 
                          : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      }}
                      whileTap={{ scale: 0.98 }}
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle size={28} color={dificultad.color} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Mensaje de Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer con Botones */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          background: '#f9fafb'
        }}>
          <button
            onClick={paso === 1 ? onCancel : handleVolverACarreras}
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
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              opacity: iniciandoEntrevista ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!iniciandoEntrevista) {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }}
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
                transition: 'all 0.2s',
                opacity: selectedCarrera ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCarrera) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Continuar
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={iniciarEntrevista}
              disabled={!selectedDificultad || iniciandoEntrevista}
              style={{
                flex: 2,
                padding: '0.875rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: selectedDificultad && !iniciandoEntrevista
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : '#e5e7eb',
                color: 'white',
                fontWeight: 600,
                cursor: (selectedDificultad && !iniciandoEntrevista) ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                transition: 'all 0.2s',
                opacity: (selectedDificultad && !iniciandoEntrevista) ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (selectedDificultad && !iniciandoEntrevista) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {iniciandoEntrevista ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%'
                    }}
                  />
                  Iniciando...
                </>
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