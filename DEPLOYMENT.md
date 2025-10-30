# 🚀 Guía de Despliegue - Sistema de Empeños

Esta guía te ayudará a desplegar el sistema de empeños desde cero después de clonar el repositorio.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** (con Docker Compose)
- **Git**
- **Node.js 18+** (opcional, solo si quieres desarrollo local)

---

## 🔧 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Roan1982/empenio.git
cd empenio
```

### 2. Construir y Levantar los Contenedores

```bash
# Construir las imágenes (puede tardar algunos minutos la primera vez)
docker-compose build --no-cache

# Levantar todos los servicios
docker-compose up -d
```

### 3. Instalar Dependencias del Frontend (Importante!)

Las librerías de Chart.js, jsPDF y XLSX necesitan ser instaladas manualmente en el contenedor:

```bash
docker exec empenio-frontend-1 npm install chart.js react-chartjs-2 jspdf jspdf-autotable xlsx --legacy-peer-deps
```

### 4. Reiniciar el Frontend

```bash
docker-compose restart frontend
```

### 5. Verificar que Todo Está Funcionando

```bash
# Ver el estado de los contenedores
docker ps

# Deberías ver 3 contenedores corriendo:
# - empenio-frontend-1 (puerto 3000)
# - empenio-backend-1 (puerto 5000)
# - empenio-ia_module-1 (puerto 5001)
```

### 6. Generar Datos de Prueba (Opcional)

Si quieres poblar la base de datos con 40 usuarios y datos de ejemplo:

```bash
docker exec empenio-backend-1 node seed-40-usuarios.js
```

---

## 🌐 Acceder a la Aplicación

- **Frontend (Usuario)**: http://localhost:3000
- **Panel Admin**: http://localhost:3000/admin
- **API Backend**: http://localhost:5000
- **Módulo IA**: http://localhost:5001

### 👤 Credenciales de Acceso

**Administrador:**
- Email: `admin@empenio.com`
- Password: `admin123`

**Usuarios regulares** (si ejecutaste el seed):
- Ver archivo `LISTA_USUARIOS_COMPLETA.md` para la lista completa
- Password para todos: `password123`
- Ejemplos:
  - `pablo.alvarez852@outlook.com`
  - `juan.martinez438@gmail.com`
  - `laura.hernandez587@gmail.com`

---

## 🔍 Verificar la Instalación

### Verificar Logs

```bash
# Ver logs del frontend
docker logs empenio-frontend-1 --tail 50

# Ver logs del backend
docker logs empenio-backend-1 --tail 50

# Ver logs en tiempo real
docker logs -f empenio-frontend-1
```

### Verificar Compilación del Frontend

Deberías ver en los logs del frontend:
```
webpack compiled with 1 warning
```

Si ves errores como "Module not found: chart.js", repite el paso 3 y 4.

---

## 🐛 Solución de Problemas Comunes

### Problema 1: "Module not found: chart.js"

**Solución:**
```bash
docker exec empenio-frontend-1 npm install chart.js react-chartjs-2 jspdf jspdf-autotable xlsx --legacy-peer-deps
docker-compose restart frontend
```

### Problema 2: Base de datos vacía

**Solución:**
```bash
docker exec empenio-backend-1 node seed-40-usuarios.js
```

### Problema 3: Puerto 3000 o 5000 ya en uso

**Solución:**
```bash
# Detener todos los contenedores
docker-compose down

# Verificar qué está usando el puerto
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Cambiar el puerto en docker-compose.yml si es necesario
# Ejemplo: cambiar "3000:3000" a "3001:3000"

# Volver a levantar
docker-compose up -d
```

### Problema 4: Contenedor no inicia (unhealthy)

**Solución:**
```bash
# Ver logs detallados
docker logs empenio-backend-1

# Reconstruir desde cero
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problema 5: Cache de navegador muestra versión antigua

**Solución:**
- **Chrome/Edge**: Ctrl + Shift + R (recarga forzada)
- **Firefox**: Ctrl + F5
- O abrir en modo incógnito: Ctrl + Shift + N

### Problema 6: Error de permisos al ejecutar comandos docker

**Solución en Windows:**
- Ejecutar PowerShell como Administrador
- Asegurar que Docker Desktop esté corriendo

---

## 🔄 Comandos Útiles

### Detener y Eliminar Todo

```bash
# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (borra la BD)
docker-compose down -v

# Eliminar imágenes
docker rmi empenio-frontend empenio-backend empenio-ia_module
```

### Reconstruir Desde Cero

```bash
# 1. Detener todo
docker-compose down

# 2. Eliminar imágenes antiguas
docker rmi empenio-frontend empenio-backend

# 3. Reconstruir sin caché
docker-compose build --no-cache

# 4. Levantar servicios
docker-compose up -d

# 5. Instalar dependencias frontend
docker exec empenio-frontend-1 npm install chart.js react-chartjs-2 jspdf jspdf-autotable xlsx --legacy-peer-deps

# 6. Reiniciar frontend
docker-compose restart frontend

# 7. (Opcional) Generar datos
docker exec empenio-backend-1 node seed-40-usuarios.js
```

### Ver Estado de la Base de Datos

```bash
# Conectar a SQLite
docker exec -it empenio-backend-1 sh
sqlite3 /app/database/empenio.db

# Dentro de SQLite:
.tables                          # Ver todas las tablas
SELECT COUNT(*) FROM usuarios;   # Contar usuarios
SELECT COUNT(*) FROM empenos;    # Contar empeños
SELECT COUNT(*) FROM objetos;    # Contar objetos
.quit                            # Salir
```

### Reiniciar Solo un Servicio

```bash
docker-compose restart frontend
docker-compose restart backend
docker-compose restart ia_module
```

---

## 📦 Estructura del Proyecto

```
empenio/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── DashboardCharts.js      # Gráficos Chart.js
│   │   │   ├── DetalleObjetoModal.js   # Modal con galería
│   │   │   └── ...
│   │   ├── pages/              # Páginas principales
│   │   │   ├── AdminPanel.js   # Panel de administración
│   │   │   ├── Dashboard.js    # Dashboard usuario
│   │   │   ├── Historial.js    # Historial de empeños
│   │   │   └── ...
│   │   ├── styles/             # Estilos CSS dedicados
│   │   │   ├── DashboardCharts.css
│   │   │   ├── DetalleObjetoModal.css
│   │   │   └── Historial.css
│   │   ├── services/           # API y servicios
│   │   └── context/            # Context API
│   └── package.json
├── server/                      # Backend Node.js
│   ├── routes/                 # Endpoints API
│   │   ├── admin.js            # Rutas admin
│   │   ├── empenos.js          # Gestión empeños
│   │   ├── usuarios.js         # Gestión usuarios
│   │   └── ...
│   ├── config/                 # Configuración
│   ├── middleware/             # Middleware Express
│   └── database/               # Base de datos SQLite
├── ia_module/                   # Módulo Python IA
├── docker-compose.yml          # Orquestación Docker
├── CAMBIOS_IMPLEMENTADOS.md   # Documentación de cambios
├── MEJORAS_PENDIENTES.md      # Lista de tareas
└── DEPLOYMENT.md              # Esta guía
```

---

## 🎨 Características Principales

### ✅ Para Usuarios:
- 📋 Dashboard personalizado
- 💰 Crear citas de valoración
- 📊 Ver historial de empeños (activos, finalizados, vencidos)
- 🔍 Filtros y búsqueda avanzada
- 📥 Exportar datos a CSV

### ✅ Para Administradores:
- 📊 Dashboard con 4 gráficos Chart.js y 4 KPIs
- 👥 Gestión de usuarios con estadísticas
- 💼 Gestión de empeños y objetos
- 📅 Gestión de citas con filtros avanzados
- 👁️ Modal de detalle de objetos con galería multimedia
- 📄 Exportar reportes a PDF (2 tipos)
- 📊 Exportar reporte completo a Excel (3 hojas)
- 🔍 Filtros y búsqueda en todas las secciones
- 📥 Exportar informe de usuarios a PDF

---

## 🔒 Seguridad

### Variables de Entorno

El proyecto usa variables de entorno para configuración sensible. Por defecto está configurado para desarrollo local.

**Para producción, cambiar:**

```bash
# En .env del backend
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
PORT=5000
NODE_ENV=production
```

### Cambiar Password de Admin

```bash
# Conectar a la base de datos
docker exec -it empenio-backend-1 sh
sqlite3 /app/database/empenio.db

# Cambiar password (debes hashearla antes en producción)
UPDATE usuarios SET password = 'nuevo_hash_bcrypt' WHERE email = 'admin@empenio.com';
```

---

## 📈 Monitoreo

### Verificar Salud de los Servicios

```bash
# Ver estado completo
docker-compose ps

# Ver logs en tiempo real de todos los servicios
docker-compose logs -f

# Ver uso de recursos
docker stats
```

---

## 🚀 Despliegue en Producción

### Consideraciones Importantes:

1. **Base de Datos**: 
   - Migrar de SQLite a PostgreSQL o MySQL para mejor rendimiento
   - Configurar backups automáticos

2. **Variables de Entorno**:
   - Cambiar JWT_SECRET a valor seguro
   - Configurar NODE_ENV=production

3. **HTTPS**:
   - Configurar certificado SSL/TLS
   - Usar reverse proxy (Nginx/Traefik)

4. **Dominio**:
   - Configurar dominio personalizado
   - Actualizar CORS en backend

5. **Logs**:
   - Configurar rotación de logs
   - Monitoreo con herramientas como PM2

6. **Escalabilidad**:
   - Considerar Kubernetes para orquestación
   - Load balancer para múltiples instancias

---

## 📞 Soporte

Si tienes problemas durante la instalación:

1. Revisa los logs: `docker logs empenio-frontend-1 --tail 100`
2. Verifica la sección "Solución de Problemas Comunes"
3. Asegúrate de haber ejecutado todos los pasos en orden
4. Verifica que Docker Desktop esté corriendo
5. Revisa que los puertos 3000, 5000 y 5001 estén disponibles

---

## ✅ Checklist de Verificación Post-Instalación

- [ ] 3 contenedores corriendo (frontend, backend, ia_module)
- [ ] Frontend accesible en http://localhost:3000
- [ ] Backend responde en http://localhost:5000
- [ ] Login admin funciona (admin@empenio.com / admin123)
- [ ] Dashboard muestra 4 gráficos Chart.js
- [ ] Botones de exportación PDF/Excel visibles en Reportes
- [ ] Modal de detalle de objetos se abre al hacer click en "Ver"
- [ ] Filtros funcionan en Citas, Objetos, Empeños
- [ ] Sin errores en consola del navegador (F12)
- [ ] Webpack compiled successfully (revisar logs frontend)

---

## 🎉 ¡Listo!

Si todos los checks están marcados, tu instalación está completa y funcionando correctamente.

**Accede a:** http://localhost:3000

**Usuario admin:** admin@empenio.com / admin123

¡Disfruta del sistema de empeños! 🚀

---

**Última actualización:** 30 de Octubre, 2025
**Versión del Sistema:** 1.0.0 (7/7 mejoras completadas)
