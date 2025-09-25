# EDUQUIARMX 🏫

Sistema integral de gestión escolar diseñado para centros de trabajo en Jalisco, México.

## 📋 Descripción

EDUQUIARMX es una plataforma web moderna que digitaliza y optimiza la gestión escolar, ofreciendo herramientas para:

- **Gestión Académica**: Calificaciones, asistencia y seguimiento estudiantil
- **Administración Escolar**: Configuración del CT, gestión de personal y reportes
- **Bienestar Estudiantil**: Sistema de semáforo de riesgo e incidentes
- **Comunicación**: Notificaciones automáticas a tutores
- **Seguridad**: Acceso con credenciales QR y roles diferenciados

## 🚀 Características Principales

### 👨‍💼 Panel del Director
- Configuración del Centro de Trabajo
- Gestión completa de personal
- Supervisión de carga académica
- Dashboard con KPIs y alertas
- Proceso de fin de ciclo escolar

### 👔 Panel del Subdirector
- Diseño de carga académica
- Gestión de catálogos (turnos, grados, grupos, materias)
- Asignación de maestros
- Workflow de aprobación

### 🤝 Panel de Trabajo Social
- Gestión de incidentes confidenciales
- Sistema de citatorios
- Seguimiento de alumnos en riesgo
- Tablero de alertas proactivas

### 👩‍🏫 Panel del Maestro
- Registro de asistencia por clase
- Captura de calificaciones
- Creación de anotaciones
- Visualización del semáforo de riesgo

### 📋 Personal de Apoyo
- Alta y gestión de alumnos
- Actualización de datos estudiantiles
- Generación de credenciales QR

### 🚪 Personal de Acceso
- Escaneo QR para registro de entrada
- Notificaciones automáticas a tutores

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Hosting**: Vercel/Netlify
- **PWA**: Vite PWA Plugin

## 📱 Arquitectura

### Modelo de Instancia Gestionada
- Una instancia aislada por Centro de Trabajo
- Máxima seguridad y rendimiento de datos
- Configuración personalizada por escuela

### Roles y Permisos
- **Row Level Security (RLS)** implementado
- Permisos granulares por funcionalidad
- Jerarquía de acceso bien definida

## 🏗️ Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes base
│   │   └── layout/       # Layouts por rol
│   ├── pages/            # Páginas principales
│   │   ├── auth/         # Autenticación
│   │   ├── director/     # Panel Director
│   │   ├── subdirector/  # Panel Subdirector
│   │   ├── maestro/      # Panel Maestro
│   │   ├── trabajosocial/ # Panel Trabajo Social
│   │   ├── apoyo/        # Panel Apoyo
│   │   └── acceso/       # Panel Acceso
│   ├── hooks/            # Hooks personalizados
│   ├── services/         # Servicios API
│   ├── utils/            # Utilidades
│   └── styles/           # Estilos globales
├── .env                  # Variables de entorno
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚦 Funcionalidades Avanzadas

### Sistema de Semáforo de Riesgo
- **Verde**: Alumno sin problemas
- **Amarillo**: Alerta temprana
- **Rojo**: Requiere intervención inmediata

### Proceso de Fin de Ciclo
- Cierre de calificaciones ordinarias
- Gestión de exámenes extraordinarios
- Cálculo automático de promoción/repetición
- Generación de historial académico

### Gestión de Incidentes
- Registro confidencial de casos graves
- Seguimiento de acciones tomadas
- Generación de citatorios automáticos

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase configurada
- Variables de entorno configuradas

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/secfederal67/SecFed67.git
cd SecFed67/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

## 📊 Base de Datos

### Tablas Principales
- **Configuración**: ct_info, ciclos_escolares, dias_inhabiles
- **Académicas**: turnos, grados, grupos, materias, carga_academica
- **Usuarios**: profiles, alumnos, inscripciones
- **Transaccionales**: asistencia, calificaciones, evaluaciones
- **Seguimiento**: incidentes, anotaciones, semaforo

### Seguridad
- Row Level Security (RLS) habilitado
- Políticas granulares por rol
- Funciones auxiliares para permisos

## 🔒 Seguridad y Privacidad

- **Aislamiento de datos** por Centro de Trabajo
- **Encriptación** de datos sensibles
- **Autenticación robusta** con Supabase Auth
- **Permisos granulares** por funcionalidad
- **Auditoría** de acciones críticas

## 📈 Roadmap

### Versión Actual (v1.0)
- ✅ Sistema de autenticación
- ✅ Panel del Director completo
- ✅ Configuración del CT
- ✅ Gestión de personal
- 🔄 Integración completa de todos los paneles

### Próximas Versiones
- 📱 App móvil nativa
- 🔗 Integración con WhatsApp
- 📊 Reportes avanzados y analytics
- 🎓 Módulo de boletas digitales
- 🌐 API pública para integraciones

## 🤝 Contribución

Este es un proyecto privado desarrollado para la Escuela Secundaria Federal No. 67. Las contribuciones están restringidas al equipo de desarrollo autorizado.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

**EDUQUIARMX** - Transformando la gestión escolar con tecnología moderna 🚀