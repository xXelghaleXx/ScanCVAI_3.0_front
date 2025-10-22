/**
 * Configuración centralizada de la API
 * Lee la URL del backend desde variables de entorno
 */

// URL base de la API - prioriza variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://scancvai-3-0-back.onrender.com/api';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Configuración de la app
const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'ScanCVAI',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  mode: import.meta.env.MODE || 'development'
};

// Configuración de archivos
const FILE_CONFIG = {
  maxSize: import.meta.env.VITE_MAX_FILE_SIZE || 10485760, // 10MB por defecto
  allowedTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Configuración de API cargada:');
  console.log('   📡 API URL:', API_BASE_URL);
  console.log('   🔑 Google Client ID:', GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'No configurado');
  console.log('   🎯 Modo:', APP_CONFIG.mode);
}

// Exportar configuración
export { API_BASE_URL, GOOGLE_CLIENT_ID, APP_CONFIG, FILE_CONFIG };

export default {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  APP_CONFIG,
  FILE_CONFIG
};
