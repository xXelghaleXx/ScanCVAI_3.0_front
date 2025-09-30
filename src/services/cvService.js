import api from './Api';

class CVService {
  
  // 📄 Subir nuevo CV
  async uploadCV(file) {
    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error subiendo CV' 
      };
    }
  }

  // 🧠 Procesar CV con IA
  async processCV(cvId) {
    try {
      const response = await api.post(`/cv/${cvId}/procesar`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error procesando CV' 
      };
    }
  }

  // 📊 Generar informe
  async generateReport(cvId) {
    try {
      const response = await api.post(`/cv/${cvId}/informe`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error generando informe' 
      };
    }
  }

  // 📋 Obtener historial completo
  async getHistory(page = 1, limit = 10, sort = 'desc') {
    try {
      const response = await api.get('/cv/historial', {
        params: { page, limit, sort }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error obteniendo historial' 
      };
    }
  }

  // 📈 Obtener estadísticas
  async getStatistics() {
    try {
      const response = await api.get('/cv/historial/estadisticas');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error obteniendo estadísticas' 
      };
    }
  }

  // 🔍 Buscar en historial
  async searchHistory(filters) {
    try {
      const response = await api.get('/cv/historial/buscar', {
        params: filters
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error buscando en historial' 
      };
    }
  }

  // 📥 Exportar historial
  async exportHistory(formato = 'json') {
    try {
      const response = await api.get('/cv/historial/exportar', {
        params: { formato },
        responseType: 'blob'
      });

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `historial_cvs_${Date.now()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error exportando historial' 
      };
    }
  }

  // 📊 Comparar dos CVs
  async compareCVs(cv1Id, cv2Id) {
    try {
      const response = await api.get('/cv/historial/comparar', {
        params: { cv1Id, cv2Id }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error comparando CVs' 
      };
    }
  }

  // 🗑️ Eliminar CV
  async deleteCV(cvId) {
    try {
      const response = await api.delete(`/cv/${cvId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error eliminando CV' 
      };
    }
  }

  // 📋 Obtener lista simple de CVs
  async getCVs() {
    try {
      const response = await api.get('/cv');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error obteniendo CVs' 
      };
    }
  }
}

const cvService = new CVService();
export default cvService;