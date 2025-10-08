// src/components/CarreraSelector.jsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, ChevronRight, CheckCircle, Zap, Award, Flame } from 'lucide-react';
import authService from '../services/authService';
import entrevistaService from '../services/entrevistaService';
import { toast } from 'react-toastify';

const CarreraSelector = ({ onEntrevistaIniciada, onCancel }) => {
  const [paso, setPaso] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedDificultad, setSelectedDificultad] = useState(null);
  const [iniciandoEntrevista, setIniciandoEntrevista] = useState(false);
  const [error, setError] = useState(null);

  // IMPORTANTE: Mapeo de dificultades frontend ↔ backend
  const dificultades = [
    {
      id: 'basica', // Backend espera 'basica'
      nombre: 'Básica',
      descripcion: 'Preguntas básicas y fundamentales',
      icon: Zap,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'intermedia', // Backend espera 'intermedia'
      nombre: 'Intermedia',
      descripcion: 'Preguntas de nivel medio con casos prácticos',
      icon: Award,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'avanzada', // Backend espera 'avanzada'
      nombre: 'Avanzada',
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
      setError(null);
      
      console.log('📚 Cargando carreras...');
      
      // Usar authService para obtener carreras
      const result = await authService.getCarreras();
      
      if (result.success) {
        console.log('✅ Carreras cargadas:', result.carreras.length);
        setCarreras(result.carreras || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error cargando carreras:', error);
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
    console.log('📚 Carrera seleccionada:', carrera.nombre);
    setSelectedCarrera(carrera);
    setError(null);
  };

  const handleSelectDificultad = (dificultad) => {
    console.log('📊 Dificultad seleccionada:', dificultad.nombre);
    setSelectedDificultad(dificultad);
    setError(null);
  };

  const handleContinuarADificultad = () => {
    if (selectedCarrera) {
      console.log('➡️ Avanzando a selección de dificultad');
      setPaso(2);
      setError(null);
    }
  };

  const handleVolverACarreras = () => {
    console.log('⬅️ Volviendo a selección de carreras');
    setPaso(1);
    setSelectedDificultad(null);
    setError(null);
  };

  const iniciarEntrevista = async () => {
    if (!selectedCarrera || !selectedDificultad) {
      toast.error('Selecciona una carrera y dificultad');
      return;
    }

    try {
      setIniciandoEntrevista(true);
      setError(null);

      console.log('🚀 Iniciando entrevista...');
      console.log('  📚 Carrera:', selectedCarrera.nombre, `(ID: ${selectedCarrera.id})`);
      console.log('  📊 Dificultad:', selectedDificultad.nombre, `(${selectedDificultad.id})`);

      // Llamar al servicio
      const result = await entrevistaService.iniciarEntrevista(
        selectedCarrera.id,
        selectedDificultad.id
      );

      if (result.success) {
        console.log('✅ Entrevista iniciada exitosamente');
        console.log('  🆔 ID:', result.data.entrevistaId);
        console.log('  💬 Mensaje inicial:', result.data.mensajeInicial.substring(0, 50) + '...');
        
        toast.success(`Entrevista iniciada: ${selectedCarrera.nombre}`);
        
        // Llamar callback con estructura correcta
        onEntrevistaIniciada({
          entrevistaId: result.data.entrevistaId,
          carrera: selectedCarrera,
          dificultad: selectedDificultad,
          mensajeInicial: result.data.mensajeInicial,
          aiDisponible: result.data.aiDisponible
        });
        
      } else {
        // Manejar error específico de entrevista activa
        if (result.entrevistaActiva) {
          const confirmar = window.confirm(
            `Ya tienes una entrevista activa de ${result.entrevistaActiva.carrera_id || 'una carrera'}.\n\n` +
            `¿Deseas abandonarla e iniciar una nueva?`
          );
          
          if (confirmar) {
            // Abandonar la entrevista activa
            const abandonResult = await entrevistaService.abandonarEntrevista(
              result.entrevistaActiva.id
            );
            
            if (abandonResult.success) {
              // Intentar iniciar nuevamente
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
      console.error('❌ Error al iniciar entrevista:', error);
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
              <Flame size={32} color="white" />
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

        {/* Contenido */}
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
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Lista de Carreras */}
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
                      <motion.div
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
                          justifyContent: 'space-between'
                        }}
                        whileHover={{ scale: 1.02 }}
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
                {dificultades.map((dificultad) => {
                  const Icon = dificultad.icon;
                  return (
                    <motion.div
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
                        gap: '1.5rem'
                      }}
                      whileHover={{ scale: 1.02 }}
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
                        <CheckCircle size={28} color={dificultad.color} />
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

        {/* Footer */}
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
              fontFamily: 'inherit',
              opacity: iniciandoEntrevista ? 0.5 : 1
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
                opacity: selectedCarrera ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
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
                opacity: (selectedDificultad && !iniciandoEntrevista) ? 1 : 0.5,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
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