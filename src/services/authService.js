// src/services/authService.js - ARCHIVO PARA EL FRONTEND

class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.tokenKey = 'access_token';
    this.refreshTokenKey = 'refresh_token';
    this.userKey = 'user';
    
    console.log('🔧 AuthService inicializado correctamente en el FRONTEND');
    console.log('🔧 Base URL:', this.baseURL);
  }

  // ========== MÉTODOS DE UTILIDAD ==========
  
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

    getCurrentUser() {
    return this.getUser();
  }
  
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        console.log('🕐 Token expirado, limpiando localStorage');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      this.logout();
      return false;
    }
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('nombre');
  }

  // ========== LOGIN TRADICIONAL ==========
  
  async login(credentials) {
    try {
      console.log('🔐 AuthService: Iniciando login tradicional');
      
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: credentials.email || credentials.correo,
          contrasena: credentials.password || credentials.contrasena,
          client_id: 'frontend_app',
          client_secret: '123456'
        })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        this.handleSuccessfulLogin(data);
        return { success: true, user: this.getUser() };
      } else {
        console.error('❌ Login fallido:', data);
        return { 
          success: false, 
          error: data.error || data.message || 'Error de autenticación' 
        };
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { 
        success: false, 
        error: 'Error de conexión' 
      };
    }
  }

  // ========== LOGIN CON GOOGLE ==========
  async loginWithGoogle(googleCredential) {
  try {
    console.log('🔐 AuthService: Iniciando login con Google');
    console.log('🎫 Credential recibido:', googleCredential.substring(0, 20) + '...');
    
    const response = await fetch(`${this.baseURL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        credential: googleCredential,  // ← Asegurarse de que se envía como 'credential'
        client_id: 'frontend_app',
        client_secret: '123456'
      })
    });

    console.log('📥 Respuesta del backend:', response.status);

    const data = await response.json();
    console.log('📄 Datos recibidos:', data);

    if (response.ok && data.access_token) {
      console.log('✅ Login con Google exitoso');
      this.handleSuccessfulLogin(data);
      return { 
        success: true, 
        user: this.getUser() 
      };
    } else {
      console.error('❌ Login con Google fallido:', data);
      return { 
        success: false, 
        error: data.error || data.message || 'Error de autenticación' 
      };
    }
  } catch (error) {
    console.error('❌ Error en loginWithGoogle:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

  // ========== REGISTRO ==========
  
  async registro(userData) {
    try {
      console.log('📝 AuthService: Iniciando registro');
      
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Registro exitoso');
        return { success: true, data };
      } else {
        console.error('❌ Registro fallido:', data);
        throw new Error(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  // ========== MANEJO DE LOGIN EXITOSO ==========
  
  handleSuccessfulLogin(data) {
    console.log('💾 Guardando datos de autenticación...');
    
    localStorage.setItem(this.tokenKey, data.access_token);
    localStorage.setItem(this.refreshTokenKey, data.refresh_token);
    localStorage.setItem('token_type', data.token_type);
    localStorage.setItem('expires_in', data.expires_in);

    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      const userData = {
        id: payload.id || payload.sub,
        email: payload.correo || payload.email,
        nombre: payload.nombre || payload.name,
        apellido: payload.apellido || payload.family_name,
        picture: payload.picture,
        rol: payload.rol || 'alumno',  // NUEVO: Guardar rol del usuario
        iat: payload.iat,
        exp: payload.exp
      };

      localStorage.setItem(this.userKey, JSON.stringify(userData));
      localStorage.setItem('nombre', userData.nombre || userData.email);

      console.log('👤 Datos de usuario guardados:', userData);
    } catch (jwtError) {
      console.warn('⚠️ Error decodificando JWT:', jwtError);
      localStorage.setItem('nombre', 'Usuario');
    }
  }

  // ========== REFRESH TOKEN ==========
  
  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          client_id: 'frontend_app',
          client_secret: '123456'
        })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        this.handleSuccessfulLogin(data);
        return { success: true };
      } else {
        console.error('❌ Error renovando token:', data);
        this.logout();
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error en refresh token:', error);
      this.logout();
      return { success: false };
    }
  }

  // ========== PETICIONES AUTENTICADAS ==========
  
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        console.log('🔄 Token expirado, intentando renovar...');
        const refreshResult = await this.refreshAccessToken();
        
        if (refreshResult.success) {
          const newToken = this.getToken();
          headers.Authorization = `Bearer ${newToken}`;
          
          return await fetch(url, {
            ...options,
            headers
          });
        } else {
          throw new Error('Sesión expirada');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Error en petición autenticada:', error);
      throw error;
    }
  }

  // ========== MÉTODOS DE PERFIL ==========
  
  async getProfile() {
    try {
      const response = await this.authenticatedRequest(`${this.baseURL}/auth/profile`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, user: data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.authenticatedRequest(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, user: data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== OBTENER CARRERAS ==========

  async getCarreras() {
    try {
      console.log('📚 AuthService: Obteniendo carreras...');

      const response = await this.authenticatedRequest(`${this.baseURL}/carreras`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Carreras obtenidas:', data.carreras?.length || 0);
        return {
          success: true,
          carreras: data.carreras || []
        };
      } else {
        console.error('❌ Error obteniendo carreras:', data);
        return {
          success: false,
          error: data.error || data.message || 'Error al obtener carreras'
        };
      }
    } catch (error) {
      console.error('❌ Error en getCarreras:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión'
      };
    }
  }
}

// Crear una instancia única del servicio
const authService = new AuthService();

// Exportar de ambas formas para mayor compatibilidad
export { authService };
export default authService;