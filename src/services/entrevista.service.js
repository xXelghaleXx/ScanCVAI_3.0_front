// src/services/entrevistaService.js - VERSIÓN CORREGIDA

import authService from './auth.service';
import { API_BASE_URL } from '../config/api.config.js';

class EntrevistaService {
  
  // ========== INICIAR NUEVA ENTREVISTA ==========
  async iniciarEntrevista(carreraId, dificultad) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🎯 Iniciando entrevista con:');
      console.log('  📚 Carrera ID:', carreraId);
      console.log('  📊 Dificultad:', dificultad);

      // IMPORTANTE: El backend espera 'carreraId' (camelCase), no 'carreraid'
      const payload = {
        carreraId: carreraId,
        dificultad: dificultad
      };

      console.log('📤 Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/entrevistas/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        
        // Si ya hay una entrevista activa, retornar info específica
        if (errorData.error && errorData.error.includes('entrevista en progreso')) {
          return { 
            success: false, 
            error: errorData.error,
            entrevistaActiva: errorData.entrevista_activa
          };
        }
        
        throw new Error(errorData.error || 'Error al iniciar entrevista');
      }

      const data = await response.json();
      console.log('✅ Respuesta del servidor:', data);
      
      /**
       * ESTRUCTURA DE LA RESPUESTA DEL BACKEND:
       * {
       *   message: "Entrevista iniciada correctamente",
       *   entrevista: {
       *     id: 123,
       *     carrera: "Desarrollo de Software",
       *     dificultad: "intermedia",
       *     estado: "en_progreso",
       *     fecha: "2025-10-07T..."
       *   },
       *   mensaje_ia: "¡Hola! Bienvenido...",
       *   ai_disponible: true,
       *   es_nueva: true
       * }
       */
      
      return { 
        success: true, 
        data: {
          entrevistaId: data.entrevista.id,
          carreraNombre: data.entrevista.carrera,
          dificultad: data.entrevista.dificultad,
          mensajeInicial: data.mensaje_ia,
          aiDisponible: data.ai_disponible,
          esNueva: data.es_nueva !== false
        }
      };
    } catch (error) {
      console.error('❌ Error al iniciar entrevista:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== ENVIAR MENSAJE ==========
  async enviarMensaje(entrevistaId, mensaje) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('📤 Enviando mensaje:');
      console.log('  🆔 Entrevista:', entrevistaId);
      console.log('  💬 Mensaje:', mensaje.substring(0, 50) + '...');

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/mensaje`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mensaje })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al enviar mensaje');
      }

      const data = await response.json();
      console.log('✅ Mensaje enviado');
      
      /**
       * ESTRUCTURA DE LA RESPUESTA:
       * {
       *   message: "Mensaje enviado correctamente",
       *   respuesta_ia: "Excelente...",
       *   total_mensajes: 4,
       *   mensajes_usuario: 2,
       *   mensajes_asistente: 2,
       *   puede_finalizar: true,
       *   ai_disponible: true
       * }
       */
      
      return { 
        success: true, 
        data: {
          respuesta: data.respuesta_ia,
          totalMensajes: data.total_mensajes,
          mensajesUsuario: data.mensajes_usuario,
          puedeFinalizar: data.puede_finalizar,
          aiDisponible: data.ai_disponible
        }
      };
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== FINALIZAR ENTREVISTA ==========
  async finalizarEntrevista(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🏁 Finalizando entrevista:', entrevistaId);

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        
        // Error específico: no hay mensajes suficientes
        if (errorData.error && errorData.error.includes('responder al menos')) {
          return {
            success: false,
            error: errorData.error,
            mensajesUsuario: errorData.mensajes_usuario_actuales || 0,
            mensajesRequeridos: 1
          };
        }
        
        throw new Error(errorData.error || 'Error al finalizar entrevista');
      }

      const data = await response.json();
      console.log('✅ Entrevista finalizada:', data);
      
      /**
       * ESTRUCTURA DE LA RESPUESTA:
       * {
       *   message: "Entrevista finalizada correctamente",
       *   evaluacion: {
       *     puntuacion_global: 8.5,
       *     nivel_desempenio: "Muy Bueno",
       *     fortalezas: [...],
       *     areas_mejora: [...],
       *     evaluacion_detallada: {...},
       *     recomendacion: "...",
       *     comentario_final: "...",
       *     proximos_pasos: [...]
       *   },
       *   estadisticas: {
       *     duracion_minutos: 15,
       *     total_intercambios: 5,
       *     ...
       *   },
       *   ai_disponible: true
       * }
       */
      
      return { 
        success: true, 
        data: {
          evaluacion: data.evaluacion,
          estadisticas: data.estadisticas,
          aiDisponible: data.ai_disponible
        }
      };
    } catch (error) {
      console.error('❌ Error al finalizar entrevista:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== ABANDONAR ENTREVISTA ==========
  async abandonarEntrevista(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🚪 Abandonando entrevista:', entrevistaId);

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/abandonar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al abandonar entrevista');
      }

      const data = await response.json();
      console.log('✅ Entrevista abandonada');
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al abandonar entrevista:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER HISTORIAL DE ENTREVISTA ESPECÍFICA ==========
  async obtenerHistorialEntrevista(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/historial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener historial');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER TODAS LAS ENTREVISTAS ==========
  async obtenerTodasEntrevistas(filtros = {}) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      // Construir query params
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.carreraId) params.append('carreraId', filtros.carreraId);
      if (filtros.dificultad) params.append('dificultad', filtros.dificultad);

      const url = `${API_BASE_URL}/entrevistas${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener entrevistas');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener entrevistas:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER ESTADÍSTICAS ==========
  async obtenerEstadisticas() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/entrevistas/estadisticas/resumen`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener estadísticas');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== DIAGNOSTICAR ENTREVISTA (útil para debug) ==========
  async diagnosticarEntrevista(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/diagnostico`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al diagnosticar');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al diagnosticar:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== GUARDAR ENTREVISTA EN LOCALSTORAGE ==========
  guardarEntrevistaLocal(entrevistaId, chatHistory, carrera = null, dificultad = null) {
    try {
      const datos = {
        id: entrevistaId,
        chatHistory: chatHistory || [],
        carrera: carrera || null,
        dificultad: dificultad || null,
        timestamp: Date.now()
      };

      localStorage.setItem('entrevistaActual', JSON.stringify(datos));
      
      // Guardar también carrera y dificultad por separado (redundancia útil)
      if (carrera) {
        localStorage.setItem('carreraSeleccionada', JSON.stringify(carrera));
      }
      if (dificultad) {
        localStorage.setItem('dificultadSeleccionada', JSON.stringify(dificultad));
      }
      
      console.log('💾 Entrevista guardada en localStorage:', {
        id: entrevistaId,
        mensajes: chatHistory.length,
        carrera: carrera?.nombre || 'N/A'
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al guardar entrevista:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== RECUPERAR ENTREVISTA DE LOCALSTORAGE ==========
  recuperarEntrevistaLocal() {
    try {
      const entrevistaGuardada = localStorage.getItem('entrevistaActual');
      
      if (!entrevistaGuardada) {
        console.log('📭 No hay entrevista guardada');
        return { success: false, error: 'No hay entrevista guardada' };
      }

      const data = JSON.parse(entrevistaGuardada);
      
      // Verificar expiración (24 horas)
      const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000;
      const tiempoTranscurrido = Date.now() - data.timestamp;
      
      if (tiempoTranscurrido > TIEMPO_EXPIRACION) {
        console.log('⏰ Entrevista expirada (más de 24h)');
        this.limpiarEntrevistaLocal();
        return { success: false, error: 'La entrevista guardada ha expirado' };
      }

      // Recuperar también carrera y dificultad si existen por separado
      const carreraStr = localStorage.getItem('carreraSeleccionada');
      const dificultadStr = localStorage.getItem('dificultadSeleccionada');
      
      if (carreraStr && !data.carrera) {
        data.carrera = JSON.parse(carreraStr);
      }
      
      if (dificultadStr && !data.dificultad) {
        data.dificultad = JSON.parse(dificultadStr);
      }

      console.log('✅ Entrevista recuperada:', {
        id: data.id,
        mensajes: data.chatHistory?.length || 0,
        carrera: data.carrera?.nombre || 'N/A',
        edad: Math.round(tiempoTranscurrido / 1000 / 60) + ' min'
      });
      
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error al recuperar entrevista:', error);
      this.limpiarEntrevistaLocal();
      return { success: false, error: error.message };
    }
  }

  // ========== LIMPIAR ENTREVISTA DE LOCALSTORAGE ==========
  limpiarEntrevistaLocal() {
    try {
      localStorage.removeItem('entrevistaActual');
      localStorage.removeItem('carreraSeleccionada');
      localStorage.removeItem('dificultadSeleccionada');
      console.log('🧹 LocalStorage limpiado');
      return { success: true };
    } catch (error) {
      console.error('❌ Error al limpiar localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== VERIFICAR SI HAY ENTREVISTA EN CURSO ==========
  hayEntrevistaEnCurso() {
    try {
      const entrevista = localStorage.getItem('entrevistaActual');
      
      if (!entrevista) {
        return false;
      }

      const data = JSON.parse(entrevista);
      const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000;
      const tiempoTranscurrido = Date.now() - data.timestamp;
      
      if (tiempoTranscurrido > TIEMPO_EXPIRACION) {
        this.limpiarEntrevistaLocal();
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error al verificar entrevista:', error);
      return false;
    }
  }

  // ========== OBTENER ENTREVISTA ACTIVA DEL BACKEND ==========
  async obtenerEntrevistaActiva() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      // Obtener todas las entrevistas y filtrar la que está en progreso
      const response = await fetch(`${API_BASE_URL}/entrevistas?estado=en_progreso`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener entrevista activa');
      }

      const data = await response.json();

      // Si hay entrevistas en progreso, retornar la primera
      if (data.entrevistas && data.entrevistas.length > 0) {
        return { success: true, data: data.entrevistas[0] };
      }

      // No hay entrevista activa
      return { success: true, data: null };

    } catch (error) {
      console.error('❌ Error al obtener entrevista activa:', error);
      return { success: false, error: error.message };
    }
  }
}

const entrevistaService = new EntrevistaService();

export { entrevistaService };
export default entrevistaService;