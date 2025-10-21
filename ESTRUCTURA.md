# Estructura del Proyecto Frontend-Alumnos

## 📁 Estructura Reorganizada

```
frontend-alumnos/
├── src/
│   ├── assets/                          # Recursos estáticos
│   │   ├── icons/                       # Iconos SVG
│   │   ├── images/                      # Imágenes
│   │   ├── logo.png
│   │   ├── logo2.png
│   │   └── Tecsup_fondo.png
│   │
│   ├── components/                      # Componentes reutilizables
│   │   ├── ui/                         # Componentes UI básicos
│   │   │   └── LoadingSpinner/
│   │   │       └── LoadingSpinner.jsx
│   │   │
│   │   ├── layout/                     # Componentes de layout
│   │   │   ├── Header/
│   │   │   │   └── Header.jsx
│   │   │   ├── Footer/
│   │   │   │   └── Footer.jsx
│   │   │   ├── Sidebar/
│   │   │   │   └── Slidebar.jsx
│   │   │   ├── Background/
│   │   │   │   └── Background.jsx
│   │   │   └── ThemeToggle/
│   │   │       └── ThemeToggle.jsx
│   │   │
│   │   ├── forms/                      # Componentes de formularios
│   │   │   └── CarreraSelector/
│   │   │       └── CarreraSelector.jsx
│   │   │
│   │   ├── chat/                       # Componentes de chat
│   │   │   ├── ChatBox/
│   │   │   │   └── ChatBox.jsx
│   │   │   └── ChatInput/
│   │   │       └── ChatInput.jsx
│   │   │
│   │   ├── cv/                         # Componentes de CV
│   │   │   ├── LectorCV/
│   │   │   │   └── LectorCV.jsx
│   │   │   └── HistorialCV/
│   │   │       └── HistorialCV.jsx
│   │   │
│   │   ├── entrevista/                 # Componentes de entrevista
│   │   │   ├── Entrevista/
│   │   │   │   └── Entrevista.jsx
│   │   │   ├── ResultadosEntrevista/
│   │   │   │   └── ResultadosEntrevista.jsx
│   │   │   └── HistorialEntrevistas/
│   │   │       └── HistorialEntrevistas.jsx
│   │   │
│   │   └── admin/                      # Componentes de administración
│   │       ├── UserList/
│   │       │   └── UserList.jsx
│   │       └── UserMetrics/
│   │           └── UserMetrics.jsx
│   │
│   ├── pages/                           # Páginas principales
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── Home/
│   │   │   └── WelcomePage.jsx
│   │   ├── Perfil/
│   │   │   └── PerfilPage.jsx
│   │   ├── Guia/
│   │   │   └── GuiaPage.jsx
│   │   └── Admin/
│   │       └── AdminDashboardPage.jsx
│   │
│   ├── context/                         # Context API
│   │   ├── AuthContext/
│   │   │   └── AuthContext.jsx
│   │   └── ThemeContext/
│   │       └── ThemeContext.jsx
│   │
│   ├── services/                        # Servicios API
│   │   ├── api/
│   │   │   └── interceptors.js
│   │   ├── auth.service.js
│   │   ├── cv.service.js
│   │   ├── entrevista.service.js
│   │   └── admin.service.js
│   │
│   ├── routes/                          # Configuración de rutas
│   │   └── ProtectedRoute.jsx
│   │
│   ├── styles/                          # Estilos CSS organizados
│   │   ├── base/                       # Estilos base
│   │   │   ├── variables.css
│   │   │   ├── base.css
│   │   │   └── theme.css
│   │   │
│   │   ├── layout/                     # Estilos de layout
│   │   │   ├── layout.css
│   │   │   ├── layout-refactorizado.css
│   │   │   ├── Header.css
│   │   │   ├── Footer.css
│   │   │   ├── Slidebar.css
│   │   │   └── Background.css
│   │   │
│   │   ├── components/                 # Estilos de componentes
│   │   │   ├── ui/
│   │   │   │   └── ThemeToggle.css
│   │   │   ├── forms/
│   │   │   │   └── CarreraSelector.css
│   │   │   ├── chat/
│   │   │   │   └── Chat.css
│   │   │   ├── cv/
│   │   │   │   ├── LectorCV.css
│   │   │   │   └── HistorialCV.css
│   │   │   └── admin/
│   │   │       ├── UserList.css
│   │   │       └── UserMetrics.css
│   │   │
│   │   ├── pages/                      # Estilos de páginas
│   │   │   ├── Welcome.css
│   │   │   ├── Welcome-refactorizado.css
│   │   │   ├── Login.css
│   │   │   ├── Perfil.css
│   │   │   ├── Guia.css
│   │   │   └── AdminDashboard.css
│   │   │
│   │   └── responsive/                 # Estilos responsive
│   │       ├── responsive.css
│   │       └── responsive-global.css
│   │
│   ├── hooks/                           # Custom hooks (futuro)
│   ├── utils/                           # Utilidades (futuro)
│   ├── config/                          # Configuración (futuro)
│   │
│   ├── App.jsx                          # Componente principal
│   ├── main.jsx                         # Entry point
│   └── index.css                        # CSS base
│
├── package.json
├── vite.config.js
├── eslint.config.js
└── index.html
```

## ✅ Cambios Realizados

### 1. Componentes Reorganizados
- **UI básicos**: `components/ui/`
- **Layout**: `components/layout/`
- **Formularios**: `components/forms/`
- **Chat**: `components/chat/`
- **CV**: `components/cv/`
- **Entrevista**: `components/entrevista/`
- **Admin**: `components/admin/`

### 2. Páginas Separadas
- **Auth**: Login y Register en `pages/Auth/`
- **Home**: Welcome en `pages/Home/`
- **Perfil**: `pages/Perfil/`
- **Guía**: `pages/Guia/`
- **Admin**: Dashboard en `pages/Admin/`

### 3. Estilos Organizados
- **Base**: Variables, tema, estilos base
- **Layout**: Estilos de estructura
- **Components**: Por categoría de componente
- **Pages**: Estilos de páginas completas
- **Responsive**: Media queries

### 4. Servicios Consolidados
- Eliminados duplicados (`authService.jsx`, `ProtectedRoute.jsx` en services/)
- Renombrados con convención `.service.js`
- Interceptores movidos a `services/api/`

### 5. Context Consolidado
- AuthContext y ThemeContext en carpetas propias
- Estructura uniforme

### 6. Rutas Organizadas
- ProtectedRoute movido a `routes/`
- Preparado para agregar más configuración de rutas

## 📝 Ventajas de la Nueva Estructura

1. **Escalabilidad**: Fácil agregar nuevos componentes y páginas
2. **Mantenibilidad**: Archivos organizados por función y categoría
3. **Claridad**: Separación clara entre componentes, páginas y servicios
4. **Consistencia**: Convenciones de nombres uniformes
5. **Reutilización**: Componentes fáciles de encontrar y reutilizar

## 🚀 Próximos Pasos Sugeridos

1. Crear barrel exports (`index.js`) en cada carpeta de componentes
2. Implementar custom hooks en `hooks/`
3. Agregar utilidades comunes en `utils/`
4. Configurar alias de importación en `vite.config.js`
5. Migrar gradualmente a CSS Modules

## ⚠️ Nota Importante

**Todos los estilos CSS se mantienen exactamente igual**. Solo se reorganizaron en carpetas para mejor estructura. No se modificó ningún contenido de los archivos CSS.

---

## 🔧 Correcciones Aplicadas

### Problemas Corregidos Después de la Reorganización:

1. **Import en entrevista.service.js**
   - ❌ Antes: `import authService from './authService';`
   - ✅ Después: `import authService from './auth.service';`

2. **Import en cv.service.js**
   - ❌ Antes: `import api from './Api';`
   - ✅ Después: `import api from './api/interceptors';`

3. **Import en RegisterPage.jsx**
   - ❌ Antes: `import { authService } from '../../../services/auth.service';`
   - ✅ Después: `import authService from '../../services/auth.service';`

### ✅ Estado Final:
- Servidor de desarrollo funciona correctamente
- Todos los imports actualizados
- Sin errores de compilación
- Estructura completamente funcional

