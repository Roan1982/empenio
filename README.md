# 💎 Sistema de Gestión de Empeños Inteligente

Sistema completo de gestión de empeños con **módulo de Inteligencia Artificial** para pre-cotización automática de objetos.

## 🎯 Características Principales

- ✅ **Pre-cotización automática con IA** - Machine Learning para estimar valores
- 📱 **Interfaz moderna y responsive** - Diseño limpio y profesional
- 🔐 **Sistema de autenticación** - Usuarios y administradores
- 📦 **Gestión de empeños** - Control completo del ciclo de vida
- 📅 **Sistema de citas** - Coordinación previa para concretar empeños
- 🔄 **Renovaciones automáticas** - Pago de interés para extender plazo
- 📊 **Panel administrativo** - Gestión completa del sistema

## 🏗️ Arquitectura del Sistema

### Backend
- **Node.js + Express** - API REST
- **SQLite** - Base de datos ligera
- **JWT** - Autenticación segura
- **Multer** - Manejo de archivos

### Frontend
- **React 18** - Interfaz de usuario
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **CSS Moderno** - Diseño con gradientes y animaciones

### Módulo de IA
- **Python + Flask** - API de predicción
- **scikit-learn** - Machine Learning
- **RandomForestRegressor** - Modelo de regresión
- **pandas + numpy** - Procesamiento de datos

## 🎨 Nuevas Características v2.0

- 📊 **Dashboard con gráficos Chart.js** - 4 gráficos interactivos + 4 KPIs
- 📄 **Exportación a PDF/Excel** - Reportes profesionales con múltiples formatos
- 👁️ **Modal de detalle de objetos** - Galería multimedia con lightbox fullscreen
- 🔍 **Filtros avanzados** - Búsqueda en tiempo real en todas las secciones
- 📋 **Historial completo** - Visualización de empeños pasados con filtros
- 📥 **Exportación CSV** - Descarga datos de citas, historial y más

## 📋 Requisitos Previos

**¿No tienes nada instalado?** Ejecuta `iniciar.bat` y te guiará automáticamente.

### Opción 1: Docker (Recomendada - Más Fácil)
- **Docker Desktop** - [Descargar aquí](https://www.docker.com/products/docker-desktop/)
- Todo se ejecuta en contenedores, sin instalar Node.js ni Python
- Ver guía completa en `DEPLOYMENT.md`

### Opción 2: Instalación Normal
- **Node.js** >= 16.x - [Descargar aquí](https://nodejs.org/)
- **Python** >= 3.8 - [Descargar aquí](https://www.python.org/)
- **npm** (viene con Node.js)
- **pip** (viene con Python)

### Opción 3: Portables (Sin Instalación)
- Lee `INSTALACION_SIN_DEPENDENCIAS_GLOBALES.md`

## 🚀 Instalación Rápida

### ⚡ Método 1: Asistente Automático (MÁS FÁCIL)

```cmd
iniciar.bat
```

Este script detecta qué tienes instalado y te guía paso a paso.

---

### 🔧 Método 2: Instalación Normal

**Paso 1: Instalar herramientas**
1. Descarga Node.js: https://nodejs.org/ (marca "Add to PATH")
2. Descarga Python: https://www.python.org/ (marca "Add Python to PATH")
3. Reinicia tu terminal

**Paso 2: Instalar dependencias**
```cmd
install.bat
```

**Paso 3: Iniciar aplicación**
```cmd
start.bat
```

Abre http://localhost:3000

---

### 🐳 Método 3: Docker (Recomendado - Sin Node.js/Python local)

**Paso 1: Instalar Docker Desktop**
https://www.docker.com/products/docker-desktop/

**Paso 2: Clonar el repositorio**
```bash
git clone https://github.com/Roan1982/empenio.git
cd empenio
```

**Paso 3: Construir y levantar contenedores**
```bash
docker-compose build --no-cache
docker-compose up -d
```

**Paso 4: Instalar dependencias del frontend** (IMPORTANTE)
```bash
docker exec empenio-frontend-1 npm install chart.js react-chartjs-2 jspdf jspdf-autotable xlsx --legacy-peer-deps
docker-compose restart frontend
```

**Paso 5: Poblar la base de datos** (40 usuarios + datos de prueba)
```bash
docker cp server/seed-40-usuarios.js empenio-backend-1:/app/
docker exec empenio-backend-1 node seed-40-usuarios.js
```

**Resultado:**
- ✅ 40 usuarios creados
- ✅ ~80 objetos
- ✅ ~45 citas
- ✅ ~20 empeños (estados variados)
- ✅ ~13 pagos
- ✅ ~80 notificaciones

**Acceso:**
- Frontend: http://localhost:3000
- Admin: admin@empenio.com / admin123
- Usuarios: Ver `LISTA_USUARIOS_COMPLETA.md` (password: password123)

📖 **Guía completa:** Ver `DEPLOYMENT.md` para troubleshooting

---

## �️ Instalación Manual Detallada

Si prefieres instalar paso a paso:

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roan1982/empenio.git
cd empenio
```

### 2. Instalar dependencias del Backend

```bash
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd client
npm install
cd ..
```

### 4. Configurar módulo de IA

```bash
cd ia_module

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Entrenar el modelo de IA
python train_model.py

cd ..
```

## 🎮 Ejecución

### Modo Desarrollo (3 terminales)

**Terminal 1 - Backend:**
```bash
npm run dev
```
Servidor corriendo en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Aplicación corriendo en `http://localhost:3000`

**Terminal 3 - Módulo IA:**
```bash
cd ia_module
# Activar entorno virtual
venv\Scripts\activate  # Windows
# o: source venv/bin/activate  # Linux/Mac

python api.py
```
API de IA corriendo en `http://localhost:5001`

## 📱 Uso del Sistema

### Para Usuarios

1. **Registro/Login**
   - Crear cuenta con DNI, email y contacto
   - Iniciar sesión

2. **Solicitar Pre-Cotización**
   - Subir fotos del objeto (máx. 5)
   - Completar descripción técnica
   - Subir video funcionando (opcional)
   - **IA analiza y genera cotización automática**

3. **Coordinar Cita**
   - Seleccionar fecha y horario
   - Confirmar cita para llevar el objeto

4. **Gestionar Empeños**
   - Ver empeños activos
   - Renovar pagando solo el interés
   - Finalizar pagando el total

### Para Administradores

**Credenciales de acceso:**
- Email: `admin@empenio.com`
- Password: `admin123`

**Funcionalidades:**
- Ver todas las citas programadas
- Confirmar/rechazar citas
- Ver todos los empeños del sistema
- Estadísticas generales

## 🤖 Módulo de Inteligencia Artificial

### Funcionamiento

El módulo de IA utiliza **Random Forest Regression** para predecir el valor de objetos basándose en:

- **Tipo de objeto** (Celular, Notebook, Tablet, etc.)
- **Marca** (Samsung, Apple, etc.)
- **Estado** (Nuevo, Usado, Deteriorado)
- **Antigüedad** (años)

### Dataset de Entrenamiento

El modelo está entrenado con un dataset de 40 empeños históricos que incluye:
- Celulares, notebooks, tablets, relojes, joyas, consolas, televisores
- Diferentes marcas y estados
- Valores de empeño reales

### Precisión

- **R² Score**: ~0.85-0.95
- **Confiabilidad**: Ajustada según antigüedad y estado

### API de Predicción

**Endpoint:** `POST http://localhost:5001/predict`

**Request:**
```json
{
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "estado": "Usado",
  "antiguedad": 2
}
```

**Response:**
```json
{
  "valor_estimado": 90000,
  "confiabilidad": 0.92,
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "estado": "Usado",
  "antiguedad": 2
}
```

## 📊 Modelo de Datos

### Tablas Principales

- **usuarios** - Datos de usuarios
- **administradores** - Gestores del sistema
- **objetos** - Objetos a empeñar
- **precotizaciones** - Análisis de IA
- **empenos** - Préstamos activos
- **citas** - Coordinación de visitas
- **renovaciones** - Historial de extensiones

## 🎨 Diseño y UX

### Paleta de Colores

- **Primary**: #6366f1 (Índigo)
- **Secondary**: #10b981 (Verde)
- **Danger**: #ef4444 (Rojo)
- **Warning**: #f59e0b (Amarillo)
- **Info**: #3b82f6 (Azul)

### Características de Diseño

- ✨ Gradientes modernos
- 🎭 Animaciones suaves
- 📱 Totalmente responsive
- 🌙 Sombras y profundidad
- 🎯 Componentes reutilizables

## 📁 Estructura del Proyecto

```
empenio/
├── client/                 # Frontend React
│   ├── public/
│   └── src/
│       ├── pages/         # Páginas principales
│       ├── context/       # Context API
│       ├── services/      # API client
│       └── App.js
├── server/                # Backend Node.js
│   ├── config/           # Configuración DB
│   ├── middleware/       # Middlewares
│   └── routes/           # Rutas API
├── ia_module/            # Módulo de IA Python
│   ├── api.py           # API Flask
│   ├── train_model.py   # Entrenamiento
│   └── requirements.txt
├── database/            # SQLite DB
├── uploads/             # Archivos subidos
└── package.json
```

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de archivos subidos
- ✅ Protección de rutas por roles
- ✅ CORS configurado

## 🌟 Funcionalidades Destacadas

### 1. Pre-Cotización Inteligente
El usuario sube fotos y descripción, y la IA analiza:
- Características del objeto
- Comparación con datos históricos
- Estimación de valor en segundos

### 2. Gestión de Renovaciones
- Pago solo del interés (15%)
- Extensión automática de 30 días
- Sin límite de renovaciones

### 3. Sistema de Citas
- Coordinación previa obligatoria
- Horarios disponibles 9:00 - 18:30
- Confirmación por administrador

### 4. Dashboard Informativo
- Estadísticas en tiempo real
- Empeños activos
- Citas próximas
- Alertas de vencimiento

## 🐛 Troubleshooting

### Error: No se puede conectar al backend
- Verificar que el servidor esté corriendo en puerto 5000
- Revisar el archivo `.env`

### Error: IA no responde
- Verificar que Python esté instalado
- Activar el entorno virtual
- Verificar que el modelo esté entrenado (`train_model.py`)

### Error: Base de datos
- La base de datos se crea automáticamente
- Verificar permisos de escritura en carpeta `database/`

## 📈 Mejoras Futuras

- [ ] WhatsApp API integration
- [ ] Notificaciones push
- [ ] Reconocimiento de imágenes avanzado
- [ ] Análisis de mercado en tiempo real
- [ ] App móvil nativa
- [ ] Sistema de pagos online
- [ ] Historial detallado de transacciones
- [ ] Reportes y estadísticas avanzadas

## 👥 Autores

**Gerónimo José Saucedo** y **Bruno Varanini**  
Instituto de Formación Técnica Superior N° 12  
Trabajo Práctico de Introducción a la IA y al Desarrollo de Sistemas  
2025

## 📄 Licencia

MIT License

---

**¡Sistema de Empeños Inteligente - Potenciado por IA! 🚀**
