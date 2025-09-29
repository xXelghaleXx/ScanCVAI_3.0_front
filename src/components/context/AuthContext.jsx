import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '@services/axiosInterceptor';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Verificar si el token sigue siendo válido
          try {
            await api.get('/dashboard');
          } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              // Token inválido, limpiar datos
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Registro
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', userData);
      
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al registrarse';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Login tradicional
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', {
        ...credentials,
        client_id: 'frontend_app',
        client_secret: '123456'
      });
      
      const { access_token, refresh_token } = response.data;
      
      // Guardar tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Obtener datos del usuario
      const userResponse = await api.get('/dashboard');
      const userData = userResponse.data.dashboard.alumno;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Login con Google
  const loginWithGoogle = async (googleToken) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/google', {
        token: googleToken
      });
      
      const { access_token, refresh_token } = response.data;
      
      // Guardar tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Obtener datos del usuario
      const userResponse = await api.get('/dashboard');
      const userData = userResponse.data.dashboard.alumno;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión con Google';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar localStorage y estado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      toast.success('Sesión cerrada correctamente');
    }
  };

  // Actualizar datos del usuario
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};