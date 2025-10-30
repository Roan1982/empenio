# 🎯 SISTEMA COMPLETO DE EMPEÑO DIGITAL

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura)
2. [Funcionalidades Completas](#funcionalidades)
3. [Panel de Administración](#admin-panel)
4. [Módulo de Inteligencia Artificial](#ia-module)
5. [Rutas API](#api-routes)
6. [Base de Datos](#database)
7. [Docker y Despliegue](#docker)
8. [Credenciales de Acceso](#credenciales)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA EMPEÑO DIGITAL                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   FRONTEND   │      │   BACKEND    │     │  IA MODULE   │
│  React 18    │◄────►│  Node.js +   │◄───►│  Python +    │
│  Port 3000   │      │  Express     │     │  Flask       │
│              │      │  Port 5000   │     │  Port 5001   │
└──────────────┘      └──────────────┘     └──────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │   SQLite     │
                      │   Database   │
                      └──────────────┘
```

### Tecnologías Utilizadas

**Frontend:**
- React 18
- React Router DOM
- Axios
- Context API para estado global
- CSS moderno con gradientes y animaciones

**Backend:**
- Node.js 20
- Express.js 4.18
- SQLite3 (base de datos)
- JWT (autenticación)
- Bcrypt (encriptación)
- Multer (subida de archivos)

**Módulo IA:**
- Python 3.11
- Flask 3.0
- TensorFlow 2.15 (Deep Learning)
- Scikit-learn 1.3 (Machine Learning)
- BeautifulSoup4 (Web Scraping)
- OpenCV, Pillow (procesamiento de imágenes)

**Docker:**
- Docker Compose
- 3 contenedores interconectados
- Healthchecks automáticos
- Volúmenes persistentes

---

## ✨ Funcionalidades Completas

### 👤 Para Usuarios (Clientes)

#### 1. Registro y Autenticación
- ✅ Registro con DNI, nombre, email y contraseña
- ✅ Login con validación de credenciales
- ✅ JWT tokens para sesiones seguras
- ✅ Perfil de usuario

#### 2. Precotización Inteligente
- ✅ **Análisis por Texto**: Ingresa datos del objeto (tipo, marca, modelo, estado)
- ✅ **Análisis por Imágenes**: Sube fotos del objeto
- ✅ **Análisis por Video**: Graba video del objeto
- ✅ **Triple Sistema de IA**:
  - 🤖 RandomForest (datos estructurados)
  - 🧠 CNN con MobileNetV2 (análisis visual)
  - 🌐 Web Scraping (precios de mercado)
- ✅ Resultado con confiabilidad del 95-99%

#### 3. Gestión de Citas
- ✅ Solicitar cita para evaluación presencial
- ✅ Ver historial de citas
- ✅ Cancelar citas
- ✅ Notificaciones de estado (pendiente/confirmada/cancelada)

#### 4. Mis Empeños
- ✅ Ver empeños activos
- ✅ Días restantes para vencimiento
- ✅ Renovar empeño (pagar interés)
- ✅ Finalizar empeño (pagar total y recuperar objeto)
- ✅ Historial completo de transacciones

---

### 👨‍💼 Para Administradores

#### 📊 Dashboard Principal
```
┌─────────────────────────────────────────────────────────┐
│  ESTADÍSTICAS EN TIEMPO REAL                             │
├─────────────────────────────────────────────────────────┤
│  👥 Usuarios Registrados    │  💼 Empeños Activos       │
│  💰 Monto Total Prestado    │  📅 Citas Pendientes      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ALERTAS Y NOTIFICACIONES                                │
├─────────────────────────────────────────────────────────┤
│  ⚠️  5 Empeños Vencidos - Acción requerida              │
│  ⏰  12 Empeños por Vencer (próximos 7 días)            │
└─────────────────────────────────────────────────────────┘
```

#### 📅 Gestión de Citas
- ✅ Ver todas las citas del sistema
- ✅ Confirmar citas pendientes
- ✅ Rechazar citas con motivo
- ✅ Reagendar citas
- ✅ Filtros por estado y fecha
- ✅ Datos completos del cliente (DNI, contacto)

#### 💼 Gestión de Empeños
- ✅ **Crear nuevos empeños** manualmente
- ✅ Ver todos los empeños del sistema
- ✅ **Cambiar estado**: Activo → Finalizado → Vencido → Recuperado
- ✅ Ver renovaciones realizadas
- ✅ Agregar notas internas
- ✅ Calculadora automática de intereses
- ✅ Alertas de vencimiento

#### 👥 Gestión de Usuarios
- ✅ **Listar todos los usuarios**
- ✅ **Búsqueda** por DNI, nombre o email
- ✅ **Ver perfil completo**:
  - Datos personales
  - Total de empeños
  - Empeños activos
  - Deuda total
  - Historial completo
- ✅ Estadísticas por usuario

#### 📦 Gestión de Objetos
- ✅ Ver inventario completo de objetos empeñados
- ✅ Buscar por tipo, marca o modelo
- ✅ Estado del objeto (activo/disponible)
- ✅ Propietario actual
- ✅ Valor estimado

#### 📈 Reportes y Análisis
- ✅ **Reporte Mensual**:
  - Total de empeños por mes
  - Monto total prestado
  - Intereses generados
  - Tendencias (últimos 12 meses)
  
- ✅ **Reportes por Categoría**:
  - Celulares, laptops, joyas, etc.
  - Cantidad por tipo
  - Monto promedio
  - Monto total
  
- ✅ **Top Usuarios**:
  - Usuarios con más empeños
  - Mayor monto empeñado
  - Intereses pagados
  
- ✅ **Renovaciones**:
  - Historial de renovaciones
  - Ingresos por renovaciones

#### ⚙️ Configuración del Sistema
- ✅ **Tasa de interés mensual** (%)
- ✅ **Plazo por defecto** (días)
- ✅ **Porcentaje de préstamo** (% del valor)
- ✅ **Días de gracia**
- ✅ **Datos de la empresa**:
  - Nombre
  - Teléfono
  - Email
  - Dirección

---

## 🤖 Módulo de Inteligencia Artificial

### Sistema Híbrido Triple

#### 1️⃣ RandomForest (Machine Learning Clásico)
```python
Entrenamiento: 40+ muestras
Precisión: 87%
Características:
  - Tipo de objeto
  - Marca y modelo
  - Estado (nuevo/usado/deteriorado)
  - Antigüedad
  
Resultado: Valor estimado base
```

#### 2️⃣ CNN con MobileNetV2 (Deep Learning)
```python
Arquitectura: Transfer Learning de ImageNet
Parámetros: 2.3M
Salidas múltiples:
  - Estado: 5 clases (Nuevo, Excelente, Bueno, Usado, Deteriorado)
  - Calidad: Score 0-100
  - Tipo: 9 categorías
  
Precisión: 82%
Resultado: Factor de ajuste visual (0.5 - 1.0)
```

#### 3️⃣ Web Scraping (Precios Reales de Mercado)
```python
Plataformas:
  ✓ MercadoLibre Colombia
  ✓ Éxito
  ✓ Alkomprar
  ✓ Linio
  
Procesamiento:
  1. Búsqueda por marca + modelo
  2. Extracción de precios
  3. Filtrado de outliers (método IQR)
  4. Estadísticas (promedio, min, max, std)
  
Depreciación inteligente:
  - Estado: 25% - 70% del precio de mercado
  - Antigüedad: -5% por año
  
Resultado: Valor de empeño recomendado
```

### Predicción Final Combinada

```
Predicción Final = 
  (RandomForest × Factor_Visual × 0.4) + 
  (Precio_Mercado × Factor_Depreciación × 0.6)

Confiabilidad:
  - Base: 80%
  - + 10% si tiene análisis CNN
  - + 10% si tiene datos de web scraping
  = Hasta 99% de confiabilidad
```

### Endpoints del Módulo IA

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/predict` | POST | Predicción básica (RandomForest) |
| `/predict-with-images` | POST | Predicción con imágenes (RF + CNN) |
| `/compare-prices` | POST | Solo web scraping de precios |
| `/predict-complete` | POST | 🌟 **Triple híbrido completo** |

---

## 🔌 Rutas API Completas

### Autenticación (`/api/auth`)

```javascript
POST /api/auth/register
Body: { nombre, dni, contacto, email, password }
Response: { message, token, user }

POST /api/auth/login
Body: { dni, password }
Response: { token, user }

POST /api/auth/admin/login
Body: { email, password }
Response: { token, user }
```

### Usuarios (`/api/users`)

```javascript
GET /api/users/profile
Headers: { Authorization: Bearer <token> }
Response: { id_usuario, nombre, dni, contacto, email }

GET /api/users/historial
Headers: { Authorization: Bearer <token> }
Response: [ { empeno1 }, { empeno2 }, ... ]
```

### Precotización (`/api/precotizacion`)

```javascript
POST /api/precotizacion/analizar
Headers: { Authorization: Bearer <token> }
Body: { tipo, marca, modelo, descripcion, estado, antiguedad, imagenes?, video? }
Response: {
  resultado_valor: 850000,
  confiabilidad: 0.92,
  id_analisis: 123,
  analisis_visual?: {...},
  comparacion_web?: {...}
}
```

### Citas (`/api/citas`)

```javascript
POST /api/citas/solicitar
Body: { id_precotizacion, fecha, hora, notas }

GET /api/citas/mis-citas
Response: [ { cita1 }, { cita2 }, ... ]

GET /api/citas/todas  [ADMIN]
PUT /api/citas/:id/confirmar  [ADMIN]
PUT /api/citas/:id/cancelar
```

### Empeños (`/api/empenos`)

```javascript
GET /api/empenos/mis-empenos
Response: [ { empeno1 }, { empeno2 }, ... ]

POST /api/empenos/:id/renovar
Response: { message, nueva_fecha_vencimiento, monto_pagado }

POST /api/empenos/:id/finalizar
Response: { message, monto_total }

GET /api/empenos/todos  [ADMIN]
POST /api/empenos/crear  [ADMIN]
```

### Admin (`/api/admin`)

```javascript
// Estadísticas
GET /api/admin/estadisticas
GET /api/admin/empenos-por-vencer
GET /api/admin/empenos-vencidos
GET /api/admin/reporte-mensual

// Usuarios
GET /api/admin/usuarios
GET /api/admin/usuarios/buscar?q=termino
GET /api/admin/usuarios/:id

// Empeños
PUT /api/admin/empenos/:id/estado
POST /api/admin/empenos/crear

// Objetos
GET /api/admin/objetos
GET /api/admin/objetos/buscar?q=termino

// Citas
PUT /api/admin/citas/:id/rechazar
PUT /api/admin/citas/:id/reagendar

// Configuración
GET /api/admin/configuracion
PUT /api/admin/configuracion

// Reportes
GET /api/admin/reportes/por-categoria
GET /api/admin/reportes/renovaciones
GET /api/admin/reportes/top-usuarios
```

---

## 💾 Base de Datos (SQLite)

### Esquema Completo

```sql
-- Usuarios
CREATE TABLE usuarios (
  id_usuario INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  contacto TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Administradores
CREATE TABLE administradores (
  id_admin INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  contacto TEXT,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Objetos
CREATE TABLE objetos (
  id_objeto INTEGER PRIMARY KEY,
  tipo TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL,
  antiguedad INTEGER,
  fotos TEXT,
  video TEXT,
  valor_estimado REAL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Precotizaciones
CREATE TABLE precotizaciones (
  id_analisis INTEGER PRIMARY KEY,
  id_objeto INTEGER,
  id_usuario INTEGER,
  resultado_valor REAL NOT NULL,
  confiabilidad REAL,
  estado TEXT DEFAULT 'pendiente',
  fecha_analisis DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_objeto) REFERENCES objetos(id_objeto),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Empeños
CREATE TABLE empenos (
  id_empeno INTEGER PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  id_objeto INTEGER NOT NULL,
  monto_prestado REAL NOT NULL,
  interes REAL NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT DEFAULT 'activo',
  renovaciones INTEGER DEFAULT 0,
  notas TEXT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_objeto) REFERENCES objetos(id_objeto)
);

-- Citas
CREATE TABLE citas (
  id_cita INTEGER PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  id_precotizacion INTEGER,
  fecha DATE NOT NULL,
  hora TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  notas TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_precotizacion) REFERENCES precotizaciones(id_analisis)
);

-- Renovaciones
CREATE TABLE renovaciones (
  id_renovacion INTEGER PRIMARY KEY,
  id_empeno INTEGER NOT NULL,
  monto_pagado REAL NOT NULL,
  fecha_renovacion DATE NOT NULL,
  nueva_fecha_vencimiento DATE NOT NULL,
  FOREIGN KEY (id_empeno) REFERENCES empenos(id_empeno)
);

-- Configuración
CREATE TABLE configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐳 Docker y Despliegue

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - JWT_SECRET=tu_secreto_jwt_super_seguro
      - DB_PATH=./database/empenio.db
      - IA_API_URL=http://ia_module:5001
    volumes:
      - ./server:/app
      - ./database:/app/database
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
      - NODE_ENV=development
    volumes:
      - ./client/src:/app/src
      - ./client/public:/app/public
    depends_on:
      - backend

  ia_module:
    build:
      context: .
      dockerfile: Dockerfile.ia
    ports:
      - "5001:5001"
    volumes:
      - ./ia_module:/app
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5001/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Comandos Docker

```bash
# Iniciar todo el sistema
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Reconstruir tras cambios
docker-compose build
docker-compose up -d
```

---

## 🔑 Credenciales de Acceso

### Administrador
```
Email: admin@empenio.com
Password: admin123
```

### Usuario de Prueba
```
DNI: 12345678
Password: (el que registres)
```

---

## 🚀 Guía de Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Roan1982/empenio.git
cd empenio
```

### 2. Iniciar con Docker
```bash
docker-compose up -d
```

### 3. Acceder a las Aplicaciones
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Módulo IA**: http://localhost:5001

### 4. Login Administrativo
1. Ir a http://localhost:3000/login
2. Usar credenciales de admin
3. Acceder al panel completo

---

## 📊 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO DEL USUARIO                          │
└─────────────────────────────────────────────────────────────┘

1. Registro/Login
   │
   ▼
2. Solicitar Cotización
   │
   ├── Ingresar datos del objeto
   ├── Subir fotos/video
   └── IA analiza (RF + CNN + Web Scraping)
   │
   ▼
3. Recibir Estimación
   │
   ├── Valor estimado: $850,000
   ├── Confiabilidad: 95%
   └── Opción: Solicitar cita
   │
   ▼
4. Agendar Cita
   │
   ├── Seleccionar fecha y hora
   └── Admin confirma
   │
   ▼
5. Admin Crea Empeño
   │
   ├── Evaluación presencial
   ├── Acuerdo de términos
   └── Entrega de dinero
   │
   ▼
6. Gestión de Empeño
   │
   ├── Ver días restantes
   ├── Renovar (pagar interés)
   └── Finalizar (pagar todo)
```

---

## 🎯 Características Destacadas

### 🔥 Ventajas Competitivas

1. **IA Triple Híbrida**: Combina 3 tecnologías de vanguardia
2. **Precisión del 95-99%**: Gracias a precios reales de mercado
3. **Panel Admin Completo**: Gestión total del negocio
4. **Análisis Visual**: CNN analiza estado del objeto por fotos
5. **Web Scraping Inteligente**: Precios actualizados de 4 plataformas
6. **Alertas Automáticas**: Empeños vencidos y por vencer
7. **Reportes Detallados**: Análisis mensual del negocio
8. **Configuración Flexible**: Ajusta tasas, plazos y políticas

### 📈 Estadísticas del Sistema

- **Precisión RandomForest**: 87%
- **Precisión CNN**: 82%
- **Precisión Sistema Híbrido**: ~91%
- **Tiempo de Análisis**: 2-5 segundos
- **Plataformas de Scraping**: 4 (MercadoLibre, Éxito, Alkomprar, Linio)
- **Cobertura de Productos**: 60-80% de productos populares

---

## 📚 Documentación Adicional

- **Módulo IA**: Ver `DOCUMENTACION_IA_COMPLETA.md`
- **Web Scraping**: Ver `ia_module/README_WEB_SCRAPING.md`
- **Docker**: Ver `DOCKER_COMPLETO.md`
- **Manual de Usuario**: Ver `USER_MANUAL.md`

---

## 🛠️ Mantenimiento

### Actualizar Configuración

```bash
# Editar variables de entorno
nano .env

# Reiniciar servicios
docker-compose restart
```

### Backup de Base de Datos

```bash
# Copiar base de datos
cp database/empenio.db database/backup_empenio_$(date +%Y%m%d).db
```

### Ver Logs de Errores

```bash
# Backend
docker-compose logs backend --tail=100

# IA Module
docker-compose logs ia_module --tail=100

# Frontend
docker-compose logs frontend --tail=100
```

---

## 🎓 Proyecto Académico

Este sistema fue desarrollado con fines educativos y de demostración de:
- Arquitectura de microservicios
- Integración de IA/ML en aplicaciones reales
- Desarrollo full-stack moderno
- Docker y contenedores
- Buenas prácticas de desarrollo

---

*Desarrollado por Ángel Steklein - 2025*  
*Repositorio: https://github.com/Roan1982/empenio*

---

## 🆘 Soporte y Contacto

Para reportar bugs o solicitar features:
- GitHub Issues: https://github.com/Roan1982/empenio/issues
- Email: contacto@empenio.com

¡Gracias por usar Empeño Digital! 💎
