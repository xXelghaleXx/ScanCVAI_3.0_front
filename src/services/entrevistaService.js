// src/services/entrevistaService.js

import authService from './authService';

const API_BASE_URL = 'http://localhost:3000/api';

class EntrevistaService {
  
  // ========== INICIAR NUEVA ENTREVISTA ==========
  async iniciarEntrevista() {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🎯 Iniciando entrevista...');

      const response = await fetch(`${API_BASE_URL}/entrevistas/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar entrevista');
      }

      const data = await response.json();
      console.log('✅ Entrevista iniciada:', data);
      
      return { success: true, data };
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

      console.log('📤 Enviando mensaje a entrevista:', entrevistaId);

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/mensaje`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mensaje })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar mensaje');
      }

      const data = await response.json();
      console.log('✅ Mensaje enviado, respuesta recibida');
      
      return { success: true, data };
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al finalizar entrevista');
      }

      const data = await response.json();
      console.log('✅ Entrevista finalizada');
      
      return { success: true, data };
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

      if (!response.ok) {
        const errorData = await response.json();
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

  // ========== OBTENER DIAGNÓSTICO ==========
  async obtenerDiagnostico(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('📊 Obteniendo diagnóstico de entrevista:', entrevistaId);

      const response = await fetch(`${API_BASE_URL}/entrevistas/${entrevistaId}/diagnostico`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener diagnóstico');
      }

      const data = await response.json();
      console.log('✅ Diagnóstico obtenido');
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener diagnóstico:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER HISTORIAL DE ENTREVISTA ==========
  async obtenerHistorialEntrevista(entrevistaId) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('📜 Obteniendo historial de entrevista:', entrevistaId);

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
      console.log('✅ Historial obtenido');
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER LISTA DE ENTREVISTAS ==========
  async obtenerEntrevistas(params = {}) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('📋 Obteniendo lista de entrevistas...');

      // Construir query params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.estado) queryParams.append('estado', params.estado);
      
      const url = `${API_BASE_URL}/entrevistas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      console.log('✅ Lista de entrevistas obtenida:', data.entrevistas?.length || 0);
      
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

      console.log('📊 Obteniendo estadísticas generales...');

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
      console.log('✅ Estadísticas obtenidas');
      
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== GUARDAR ENTREVISTA EN LOCALSTORAGE ==========
  guardarEntrevistaLocal(entrevistaId, chatHistory) {
    try {
      const datos = {
        id: entrevistaId,
        chatHistory: chatHistory || [],
        timestamp: Date.now()
      };

      localStorage.setItem('entrevistaActual', JSON.stringify(datos));
      console.log('💾 Entrevista guardada en localStorage');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al guardar entrevista en localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== RECUPERAR ENTREVISTA DE LOCALSTORAGE ==========
  recuperarEntrevistaLocal() {
    try {
      const entrevistaGuardada = localStorage.getItem('entrevistaActual');
      
      if (!entrevistaGuardada) {
        return { success: false, error: 'No hay entrevista guardada' };
      }

      const data = JSON.parse(entrevistaGuardada);
      
      // Verificar si la entrevista no es muy antigua (24 horas)
      const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      const tiempoTranscurrido = Date.now() - data.timestamp;
      
      if (tiempoTranscurrido > TIEMPO_EXPIRACION) {
        console.log('⏰ Entrevista guardada ha expirado (más de 24 horas)');
        this.limpiarEntrevistaLocal();
        return { success: false, error: 'La entrevista guardada ha expirado' };
      }

      console.log('✅ Entrevista recuperada de localStorage');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error al recuperar entrevista de localStorage:', error);
      this.limpiarEntrevistaLocal();
      return { success: false, error: error.message };
    }
  }

  // ========== LIMPIAR ENTREVISTA DE LOCALSTORAGE ==========
  limpiarEntrevistaLocal() {
    try {
      localStorage.removeItem('entrevistaActual');
      console.log('🧹 Entrevista eliminada de localStorage');
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

      // Verificar si no ha expirado
      const data = JSON.parse(entrevista);
      const TIEMPO_EXPIRACION = 24 * 60 * 60 * 1000;
      const tiempoTranscurrido = Date.now() - data.timestamp;
      
      if (tiempoTranscurrido > TIEMPO_EXPIRACION) {
        this.limpiarEntrevistaLocal();
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error al verificar entrevista en curso:', error);
      return false;
    }
  }

  // ========== OBTENER ID DE ENTREVISTA ACTUAL ==========
  getEntrevistaActualId() {
    try {
      const resultado = this.recuperarEntrevistaLocal();
      if (resultado.success) {
        return resultado.data.id;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al obtener ID de entrevista actual:', error);
      return null;
    }
  }

  // ========== ACTUALIZAR CHAT EN LOCALSTORAGE ==========
  actualizarChatLocal(nuevoMensaje) {
    try {
      const resultado = this.recuperarEntrevistaLocal();
      
      if (resultado.success) {
        const { id, chatHistory } = resultado.data;
        const chatActualizado = [...chatHistory, nuevoMensaje];
        this.guardarEntrevistaLocal(id, chatActualizado);
        return { success: true };
      }
      
      return { success: false, error: 'No hay entrevista activa' };
    } catch (error) {
      console.error('❌ Error al actualizar chat:', error);
      return { success: false, error: error.message };
    }
  }
}

// Crear instancia única del servicio
const entrevistaService = new EntrevistaService();

// Exportar de ambas formas para mayor compatibilidad
export { entrevistaService };
export default entrevistaService;