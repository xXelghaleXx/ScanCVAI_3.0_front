# 🎓 ScanCVAI Frontend - Sistema de Análisis de CV y Entrevistas

Frontend de la aplicación para análisis de currículums y entrevistas simuladas con inteligencia artificial.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Chart.js** + **Recharts** - Visualización de datos
- **Framer Motion** - Animaciones
- **React Hook Form** - Formularios
- **React Toastify** - Notificaciones
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
frontend-alumnos/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes UI básicos
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Formularios
│   │   ├── chat/            # Chat de entrevista
│   │   ├── cv/              # Componentes de CV
│   │   └── admin/           # Panel admin
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Auth/            # Login/Register
│   │   ├── Home/            # Página principal
│   │   ├── Perfil/          # Perfil de usuario
│   │   ├── Guia/            # Guías y tutoriales
│   │   └── Admin/           # Panel administrativo
│   ├── context/             # Context API
│   │   ├── AuthContext/     # Autenticación
│   │   └── ThemeContext/    # Tema
│   ├── services/            # Servicios API
│   │   ├── api/             # Configuración Axios
│   │   ├── auth.service.js
│   │   ├── cv.service.js
│   │   ├── entrevista.service.js
│   │   └── admin.service.js
│   ├── routes/              # Configuración de rutas
│   ├── styles/              # Estilos CSS
│   │   ├── base/            # Estilos base
│   │   ├── layout/          # Layout styles
│   │   ├── components/      # Component styles
│   │   ├── pages/           # Page styles
│   │   └── responsive/      # Media queries
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── .env.example            # Ejemplo de variables
├── vercel.json             # Config de Vercel
└── package.json
```

## ⚙️ Instalación Local

### Requisitos:
- Node.js >= 16.0.0
- npm >= 8.0.0

### Pasos:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/TU_USUARIO/scancvai-frontend.git
cd scancvai-frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita .env con tus variables
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔐 Variables de Entorno

Consulta el archivo [.env.example](.env.example) para ver todas las variables necesarias.

**Variables principales:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_APP_NAME="Sistema CV & Entrevistas"
VITE_MAX_FILE_SIZE=10485760
```

## 🎨 Características

### ✨ Funcionalidades Principales

- **Autenticación**
  - Login/Registro tradicional
  - OAuth con Google
  - Gestión de sesiones con JWT

- **Gestión de CVs**
  - Subida de archivos (PDF, DOCX)
  - Análisis automático con IA
  - Visualización de habilidades detectadas
  - Generación de informes

- **Entrevistas Simuladas**
  - Chat interactivo con IA
  - Preguntas adaptativas
  - Feedback en tiempo real
  - Historial de entrevistas

- **Dashboard**
  - Estadísticas de progreso
  - Gráficos interactivos
  - Análisis de desempeño

- **Panel Administrativo**
  - Gestión de usuarios
  - Estadísticas del sistema
  - Configuración general

### 🎨 UI/UX

- **Tema Oscuro/Claro** - Toggle entre modos
- **Diseño Responsive** - Optimizado para móvil, tablet y desktop
- **Animaciones Suaves** - Transiciones con Framer Motion
- **Notificaciones** - Toast notifications
- **Carga Progresiva** - Skeletons y loaders

## 📱 Rutas

```
/                    → Landing page
/login              → Página de login
/register           → Registro de usuario
/welcome            → Bienvenida post-login
/perfil             → Perfil de usuario
/guia               → Guías y tutoriales
/admin              → Panel administrativo (solo admin)
/dashboard          → Dashboard del usuario
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint
```

## 📦 Build para Producción

```bash
# Compilar
npm run build

# Preview local
npm run preview
```

Los archivos compilados estarán en `/dist`

## 🚀 Despliegue

### Vercel (Recomendado)

El proyecto está configurado para desplegar en Vercel automáticamente.

1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno
3. Deploy automático desde `main`

Ver guía completa: [DEPLOYMENT.md](../DEPLOYMENT.md)

### Otras Plataformas

- **Netlify**: Compatible
- **Firebase Hosting**: Compatible
- **AWS S3 + CloudFront**: Compatible

## 🔧 Configuración Avanzada

### Vite Config

El archivo `vite.config.js` incluye:
- Plugin React con SWC
- Aliases para imports
- Optimizaciones de build
- Configuración de proxy (desarrollo)

### ESLint

Configuración personalizada en `eslint.config.js`:
- Reglas de React Hooks
- Reglas de accesibilidad
- Code style

## 🎨 Estilos

### Estructura CSS

```
styles/
├── base/           # Reset, variables, fuentes
├── layout/         # Header, Footer, Sidebar
├── components/     # Estilos de componentes
├── pages/          # Estilos de páginas
└── responsive/     # Media queries
```

### Variables CSS

Definidas en `styles/base/variables.css`:
- Colores del tema
- Espaciado
- Tipografía
- Sombras
- Breakpoints

## 🐛 Troubleshooting

### Error: Cannot connect to backend
- Verifica que `VITE_API_URL` apunte al backend correcto
- Asegúrate que el backend esté corriendo
- Revisa la configuración de CORS en el backend

### Build falla
```bash
# Limpiar cache y reinstalar
rm -rf node_modules dist
npm install
npm run build
```

### Google OAuth no funciona
- Verifica `VITE_GOOGLE_CLIENT_ID`
- Asegúrate que la URL esté en las URIs autorizadas en Google Console

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC License

## 👥 Autores

- Sistema CV & Entrevistas Team

---

**Documentación adicional:**
- [Guía de Despliegue](../DEPLOYMENT.md)
- [Backend README](../backend-alumnos/README.md)
