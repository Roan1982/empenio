# 🔧 TROUBLESHOOTING - Sistema de Empeños

## Verificación Completa - 30 Oct 2025

### ✅ 1. Contenedores Docker
```bash
docker-compose ps
```
**Resultado Esperado:**
- ✅ backend: UP (healthy) - Puerto 5000
- ✅ frontend: UP - Puerto 3000
- ✅ ia_module: UP (healthy) - Puerto 5001

**Estado Actual:** ✅ TODOS CORRIENDO

---

### ✅ 2. Archivos en Contenedores

#### Backend:
```bash
docker exec empenio-backend-1 ls -la server/routes/
```
**Verificado:**
- ✅ workflow.js (12,545 bytes) - **PRESENTE**
- ✅ Registrado en index.js: `app.use('/api/workflow', require('./routes/workflow'))`

#### Frontend:
```bash
docker exec empenio-frontend-1 ls -la src/components/
```
**Verificado:**
- ✅ CrearEmpenoModal.js (9,936 bytes) - **PRESENTE**
- ✅ CrearEmpenoModal.css (5,319 bytes) - **PRESENTE**
- ✅ NotificationBell.js (4,868 bytes) - **PRESENTE**
- ✅ NotificationBell.css (4,125 bytes) - **PRESENTE**

#### Imports en AdminPanel.js:
```bash
docker exec empenio-frontend-1 grep "NotificationBell" src/pages/AdminPanel.js
```
**Verificado:**
- ✅ Import: `import NotificationBell from '../components/NotificationBell'`
- ✅ Uso: `<NotificationBell />`

---

### ✅ 3. Base de Datos

#### Tabla notificaciones:
```bash
docker exec empenio-backend-1 node seed-notificaciones.js
```
**Resultado:**
- ✅ 6 notificaciones creadas exitosamente
- ✅ Tabla funcional

---

### ✅ 4. Bug Fixes Aplicados

#### Dashboard - Contador de Citas:
```bash
docker exec empenio-frontend-1 grep "citasRes.data.filter" src/pages/Dashboard.js
```
**Verificado:**
```javascript
citasRes.data.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada')
```
✅ **BUG CORREGIDO** - Ahora cuenta citas pendientes Y confirmadas

---

## 🚦 Checklist de Funcionalidades

### 1. Notificaciones (🔔)
- [x] Tabla `notificaciones` creada en BD
- [x] 6 notificaciones de prueba insertadas
- [x] Componente `NotificationBell.js` en contenedor
- [x] Importado en `AdminPanel.js`
- [x] Endpoint `/api/workflow/notificaciones` disponible
- [x] Endpoint `/api/workflow/notificaciones/:id/leer` disponible

**Cómo probar:**
1. Ir a http://localhost:3000
2. Login como admin (admin@empenio.com / admin123)
3. Buscar campana 🔔 en navbar (esquina superior derecha)
4. Click en campana
5. Debe aparecer dropdown con 3 notificaciones

**Si no aparece:**
- Verificar consola del navegador (F12) para errores
- Verificar que el backend responda: `curl http://localhost:5000/api/workflow/notificaciones`

---

### 2. Crear Empeño desde Cita
- [x] Ruta `/api/workflow/crear-desde-cita` disponible
- [x] Ruta `/api/workflow/cita-detalle/:id` disponible
- [x] Componente `CrearEmpenoModal.js` en contenedor
- [x] Botón "Crear Empeño" en citas confirmadas
- [x] Modal integrado en AdminPanel

**Cómo probar:**
1. Ir a Panel Admin → Citas
2. Buscar una cita con estado "confirmada"
3. Debe aparecer botón "💼 Crear Empeño"
4. Click en botón
5. Debe abrir modal con formulario

**Si no aparece el botón:**
- Verificar que haya citas confirmadas en la BD
- Crear una cita de prueba y confirmarla

---

### 3. Dashboard - Citas Programadas
- [x] Bug fix aplicado en `Dashboard.js`
- [x] Filtro incluye 'pendiente' OR 'confirmada'

**Cómo probar:**
1. Login como usuario normal
2. Ir a Dashboard
3. Ver contador "Citas Programadas"
4. Debe mostrar número > 0 si hay citas confirmadas

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No veo la campana de notificaciones"

**Posibles causas:**
1. Frontend no reconstruido
2. Error de importación
3. CSS no cargado

**Solución:**
```bash
# Reconstruir frontend
docker-compose up -d --build frontend

# Verificar logs
docker logs empenio-frontend-1

# Limpiar caché del navegador (Ctrl+Shift+Del)
```

---

### Problema 2: "No veo el botón 'Crear Empeño'"

**Posibles causas:**
1. No hay citas confirmadas
2. Rol no es admin
3. Componente no importado

**Solución:**
```bash
# Verificar citas en BD
docker exec empenio-backend-1 sqlite3 database/empenio.db "SELECT * FROM citas WHERE estado='confirmada'"

# Si no hay, crear una de prueba en el admin panel
```

---

### Problema 3: "Dashboard muestra 0 citas programadas"

**Posibles causas:**
1. Bug fix no aplicado
2. No hay citas en BD

**Solución:**
```bash
# Verificar que el fix esté aplicado
docker exec empenio-frontend-1 grep "pendiente.*confirmada" src/pages/Dashboard.js

# Debe mostrar: c.estado === 'pendiente' || c.estado === 'confirmada'

# Si no está, reconstruir
docker-compose up -d --build frontend
```

---

### Problema 4: "Error al crear empeño desde cita"

**Posibles causas:**
1. Endpoint no disponible
2. Tabla empenos sin columna codigo_qr
3. Tablas notificaciones/pagos no existen

**Solución:**
```bash
# Verificar endpoint
curl -X POST http://localhost:5000/api/workflow/crear-desde-cita

# Verificar tablas en BD
docker exec empenio-backend-1 sqlite3 database/empenio.db ".schema"

# Si faltan tablas, reiniciar backend (database.js las crea al iniciar)
docker-compose restart backend
```

---

## 🔍 Comandos de Diagnóstico

### Ver logs en tiempo real:
```bash
# Backend
docker logs -f empenio-backend-1

# Frontend
docker logs -f empenio-frontend-1

# IA Module
docker logs -f empenio-ia_module-1
```

### Verificar que endpoints respondan:
```bash
# Notificaciones
curl http://localhost:5000/api/workflow/notificaciones

# Cita detalle (reemplazar 1 con ID real)
curl http://localhost:5000/api/workflow/cita-detalle/1

# Estadísticas
curl http://localhost:5000/api/workflow/estadisticas-avanzadas
```

### Inspeccionar base de datos:
```bash
# Ver todas las tablas
docker exec empenio-backend-1 sqlite3 database/empenio.db ".tables"

# Ver notificaciones
docker exec empenio-backend-1 sqlite3 database/empenio.db "SELECT * FROM notificaciones"

# Ver esquema de empenos
docker exec empenio-backend-1 sqlite3 database/empenio.db ".schema empenos"
```

### Reiniciar todo desde cero:
```bash
# Detener todo
docker-compose down

# Limpiar volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Reconstruir todo
docker-compose up -d --build

# Insertar notificaciones de prueba
docker cp server/seed-notificaciones.js empenio-backend-1:/app/
docker exec empenio-backend-1 node seed-notificaciones.js
```

---

## ✅ Estado Final de Verificación

**Fecha:** 30 de Octubre, 2025  
**Hora:** 16:00

### Contenedores:
- ✅ Backend: RUNNING (5000)
- ✅ Frontend: RUNNING (3000)
- ✅ IA Module: RUNNING (5001)

### Archivos Verificados:
- ✅ workflow.js en backend
- ✅ NotificationBell.js en frontend
- ✅ CrearEmpenoModal.js en frontend
- ✅ Imports en AdminPanel.js
- ✅ Bug fix en Dashboard.js

### Base de Datos:
- ✅ Tabla notificaciones creada
- ✅ 6 notificaciones de prueba insertadas
- ✅ Tablas pagos y contratos_firmados creadas

### Endpoints API:
- ✅ `/api/workflow/*` registrado
- ✅ 8 endpoints disponibles

---

## 🎯 Próximos Pasos para Usuario

1. **Abrir navegador:** http://localhost:3000
2. **Login admin:** admin@empenio.com / admin123
3. **Verificar campana 🔔** en navbar
4. **Ir a Citas** y verificar botón "Crear Empeño"
5. **Ir a Dashboard** (como usuario) y verificar contador

**Si algo falla:** Consultar sección "Problemas Comunes" arriba.

---

## 📞 Soporte

Si después de seguir esta guía sigues teniendo problemas:

1. Ejecuta: `docker-compose logs > logs.txt`
2. Abre consola del navegador (F12) → Tab Console
3. Captura screenshot del error
4. Reporta el problema con los logs

---

**Documento actualizado:** 30 Oct 2025, 16:00  
**Versión del sistema:** 2.0 - Revolutionary Edition
