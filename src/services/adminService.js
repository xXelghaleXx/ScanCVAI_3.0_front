import axiosInstance from "./axiosInterceptor";

const API_URL = "http://localhost:3000/api/admin";

/**
 * Servicio para gestión de administración
 */
const adminService = {
  /**
   * Obtener lista de usuarios con métricas
   * @param {Object} params - Parámetros de búsqueda (page, limit, search, rol, estado)
   * @returns {Promise<Object>} Lista de usuarios con métricas
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.rol) queryParams.append('rol', params.rol);
      if (params.estado) queryParams.append('estado', params.estado);

      const response = await axiosInstance.get(`${API_URL}/usuarios?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  },

  /**
   * Obtener métricas detalladas de un usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Métricas del usuario
   */
  async getUserMetrics(userId) {
    try {
      const response = await axiosInstance.get(`${API_URL}/usuarios/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo métricas del usuario:", error);
      throw error;
    }
  },

  /**
   * Obtener dashboard general con estadísticas de todos los usuarios
   * @returns {Promise<Object>} Dashboard con estadísticas generales
   */
  async getDashboard() {
    try {
      const response = await axiosInstance.get(`${API_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo dashboard:", error);
      throw error;
    }
  },

  /**
   * Actualizar rol de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} rol - Nuevo rol ('alumno' | 'administrador')
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUserRole(userId, rol) {
    try {
      const response = await axiosInstance.put(`${API_URL}/usuarios/${userId}/rol`, { rol });
      return response.data;
    } catch (error) {
      console.error("Error actualizando rol del usuario:", error);
      throw error;
    }
  },

  /**
   * Actualizar estado de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} estado - Nuevo estado ('activo' | 'inactivo' | 'suspendido')
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUserStatus(userId, estado) {
    try {
      const response = await axiosInstance.put(`${API_URL}/usuarios/${userId}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error("Error actualizando estado del usuario:", error);
      throw error;
    }
  }
};

export default adminService;
