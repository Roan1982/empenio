# 🎯 GUÍA DE PRUEBAS - Sistema Revolucionario de Empeños

## ✅ ESTADO ACTUAL: TODO RECONSTRUIDO Y FUNCIONANDO

**Fecha:** 30 de Octubre, 2025  
**Versión:** 2.0 - Revolutionary Edition

---

## 🚀 PASO 1: Verificar que Todo Está Corriendo

Abre PowerShell y ejecuta:
```powershell
docker-compose ps
```

**Debes ver:**
```
empenio-backend-1     UP (healthy)    5000
empenio-frontend-1    UP              3000
empenio-ia_module-1   UP (healthy)    5001
```

✅ **SI VES ESTO:** Continúa al Paso 2  
❌ **SI NO:** Ejecuta `docker-compose up -d`

---

## 🎯 PASO 2: Abrir la Aplicación

1. Abre tu navegador (Chrome/Edge recomendado)
2. Ve a: **http://localhost:3000**
3. **IMPORTANTE:** Limpia el caché (Ctrl+Shift+Delete → Borrar caché e imágenes)

---

## 👨‍💼 PASO 3: Probar como ADMINISTRADOR

### Login:
```
Email: admin@empenio.com
Password: admin123
```

### ✅ Prueba 1: Ver Notificaciones (🔔)

**Ubicación:** Navbar superior derecha

**Qué buscar:**
- Una campana 🔔 con un círculo rojo (badge)
- El badge debe mostrar un número (ej: "3")

**Acciones:**
1. Click en la campana
2. Debe aparecer un dropdown con notificaciones
3. Ejemplos de notificaciones:
   - "Hay 3 citas pendientes de confirmar"
   - "2 empeños han vencido y requieren atención"
   - "Un empeño vence en 2 días - Acción requerida"

**Qué hacer:**
- Click en una notificación para marcarla como leída
- El badge debe disminuir

**🔴 SI NO VES LA CAMPANA:**
- Abre la consola (F12 → Console)
- Busca errores en rojo
- Copia el error y repórtalo

---

### ✅ Prueba 2: Crear Empeño desde Cita

**Ubicación:** Sidebar → Citas

**Requisito previo:** Necesitas tener al menos UNA cita confirmada

**Si NO tienes citas confirmadas:**
1. Ve a: Sidebar → Citas
2. Click en "Citas Pendientes" 
3. Si hay alguna pendiente, click en botón verde "✅ Confirmar"
4. Si no hay ninguna, primero crea una cotización como usuario (ver Paso 4)

**Acciones:**
1. Ve a: Sidebar → Citas
2. Busca una fila con estado badge verde "confirmada"
3. En la columna "Acciones" debe aparecer: **"💼 Crear Empeño"**
4. Click en ese botón

**Qué debe pasar:**
- Se abre un modal grande (ventana emergente)
- El modal muestra 3 secciones:
  - **Información del Cliente:** Nombre, DNI, Contacto, Email
  - **Información del Objeto:** Tipo, Marca, Modelo, Estado, Fotos
  - **Valoración IA:** Valor estimado, Confiabilidad
- Formulario con campos:
  - **Monto prestado** (pre-llenado con 70% del valor)
  - **Interés** (con botón "Calcular 5%")
  - **Plazo** (dropdown: 15, 30, 45, 60, 90 días)
  - **Notas** (opcional)
- **Total a Pagar:** Se muestra en caja verde

**Acciones en el modal:**
1. Verifica que los campos tengan valores
2. Click en "Calcular 5%" → El interés debe llenarse automáticamente
3. Cambia el plazo → Nada cambia (es solo información)
4. Click en "✓ Crear Empeño"

**Qué debe pasar:**
- El modal se cierra
- Aparece mensaje "Empeño creado exitosamente" (o similar)
- La cita desaparece de la lista (cambió a estado "completada")
- Aparece una nueva notificación en la campana

**🔴 SI NO VES EL BOTÓN "Crear Empeño":**
- Verifica que la cita esté en estado "confirmada" (badge verde)
- Si dice "pendiente" (badge amarillo), confírmala primero

**🔴 SI EL MODAL NO ABRE:**
- Abre consola (F12 → Console)
- Busca errores
- Reporta

---

### ✅ Prueba 3: Gestión de Empeños

**Ubicación:** Sidebar → Empeños

**Qué debe mostrarse:**
- Lista de todos los empeños
- Cada fila con:
  - Usuario
  - Objeto (tipo, marca, modelo)
  - Monto
  - Interés
  - Total
  - Fecha inicio
  - Fecha vencimiento
  - Estado (badge)

**Acciones:**
- Verifica que el empeño recién creado aparezca aquí
- El estado debe ser "activo" (badge verde)

---

### ✅ Prueba 4: Dashboard Estadísticas

**Ubicación:** Sidebar → Dashboard (por defecto al entrar)

**Qué debe mostrarse:**
- Tarjetas con estadísticas:
  - Total Usuarios
  - **Citas Pendientes** (debe mostrar número > 0 si hay citas confirmadas)
  - Empeños Activos
  - Monto Total Prestado

**Alertas (si aplica):**
- ⚠️ "X Empeños Vencidos"
- ⏰ "X Empeños por Vencer (7 días)"

---

## 👤 PASO 4: Probar como USUARIO NORMAL

### Logout:
- Click en botón "🚪 Salir" (navbar superior derecha)

### Crear Nueva Cuenta:
1. En login, click en "¿No tienes cuenta? Regístrate"
2. Llena el formulario:
   ```
   Nombre: Juan Pérez
   Email: juan@test.com
   Password: test123
   DNI: 12345678
   Teléfono: 5551234567
   Dirección: Calle Test 123
   ```
3. Click en "Registrarse"

### Login con Usuario:
```
Email: juan@test.com
Password: test123
```

---

### ✅ Prueba 5: Solicitar Cotización

**Ubicación:** Dashboard → Botón "💎 Solicitar Cotización"

**Acciones:**
1. Click en "Solicitar Cotización"
2. Llena formulario:
   ```
   Tipo: Electrónica
   Marca: Apple
   Modelo: iPhone 14 Pro
   Estado: Excelente
   Descripción: iPhone en perfecto estado, sin rayones
   ```
3. Sube una imagen (opcional)
4. Click en "Enviar Solicitud"

**Qué debe pasar:**
- Mensaje "Cotización enviada"
- Redirige a "Mis Cotizaciones"
- La cotización aparece con estado "pendiente"
- Después de unos segundos (IA analizando), estado cambia a "completada"
- Aparece el **valor estimado** (ej: "$15,000 - $18,000")

---

### ✅ Prueba 6: Agendar Cita

**Ubicación:** En la cotización completada

**Acciones:**
1. Ve a "Mis Cotizaciones"
2. Busca la cotización completada
3. Click en botón "📅 Agendar Cita"
4. Selecciona:
   ```
   Fecha: Cualquier día futuro
   Hora: Cualquier hora disponible
   ```
5. Click en "Confirmar Cita"

**Qué debe pasar:**
- Mensaje "Cita agendada"
- Redirige a "Mis Citas"
- La cita aparece con estado "pendiente"
- El admin recibe notificación

---

### ✅ Prueba 7: Dashboard Usuario - Contador de Citas

**Ubicación:** Dashboard principal (al entrar)

**Qué debe mostrarse:**
- Tarjeta "Citas Programadas"
- Número debe ser > 0 si tienes citas pendientes o confirmadas

**🔴 SI MUESTRA 0:**
- Esto era el bug original
- Si sigue en 0, reporta
- Debe contar citas "pendiente" + "confirmada"

---

## 🔍 VERIFICACIONES TÉCNICAS

### Endpoint de Notificaciones:

Abre navegador en:
```
http://localhost:5000/api/workflow/notificaciones
```

**Debes ver:** JSON con array de notificaciones

---

### Base de Datos:

Ejecuta en PowerShell:
```powershell
docker exec empenio-backend-1 sqlite3 database/empenio.db "SELECT * FROM notificaciones"
```

**Debes ver:** 6 filas con notificaciones

---

## 📸 CAPTURAS RECOMENDADAS

Si todo funciona, toma capturas de:

1. ✅ Campana con notificaciones (dropdown abierto)
2. ✅ Modal "Crear Empeño" abierto con datos
3. ✅ Lista de empeños con el recién creado
4. ✅ Dashboard usuario con "Citas Programadas" > 0
5. ✅ Flujo completo: Cotización → Cita → Empeño

---

## 🐛 PROBLEMAS COMUNES

### "No veo la campana"
**Solución:**
```powershell
# Limpiar caché del navegador (Ctrl+Shift+Del)
# O usar modo incógnito (Ctrl+Shift+N)

# Verificar logs frontend:
docker logs empenio-frontend-1
```

### "No aparece botón Crear Empeño"
**Solución:**
- Asegúrate de tener una cita con estado "confirmada"
- Si está "pendiente", confírmala primero como admin

### "Dashboard muestra 0 citas"
**Solución:**
```powershell
# Verificar que el fix esté aplicado:
docker exec empenio-frontend-1 grep "confirmada" src/pages/Dashboard.js

# Debe mostrar: c.estado === 'pendiente' || c.estado === 'confirmada'

# Si no, reconstruir:
docker-compose up -d --build frontend
```

### "Error al crear empeño"
**Solución:**
```powershell
# Ver logs del backend:
docker logs empenio-backend-1 --tail 50

# Verificar que endpoint existe:
docker exec empenio-backend-1 grep "crear-desde-cita" server/routes/workflow.js
```

---

## ✅ CHECKLIST FINAL

Marca lo que funciona:

**Como Admin:**
- [ ] Veo campana 🔔 con badge
- [ ] Dropdown de notificaciones abre
- [ ] Puedo marcar notificaciones como leídas
- [ ] Veo botón "Crear Empeño" en citas confirmadas
- [ ] Modal "Crear Empeño" abre correctamente
- [ ] Puedo crear empeño exitosamente
- [ ] Dashboard muestra estadísticas

**Como Usuario:**
- [ ] Puedo registrarme
- [ ] Puedo solicitar cotización
- [ ] IA valora mi objeto
- [ ] Puedo agendar cita
- [ ] Dashboard muestra mis citas programadas (> 0)

**Endpoints:**
- [ ] `/api/workflow/notificaciones` responde
- [ ] `/api/workflow/crear-desde-cita` existe
- [ ] `/api/workflow/cita-detalle/:id` funciona

---

## 🎉 SI TODO FUNCIONA

¡Felicidades! El sistema está 100% operacional con todas las funcionalidades revolucionarias:

- ✅ Workflow completo automatizado
- ✅ Notificaciones en tiempo real
- ✅ Modal profesional para crear empeños
- ✅ Auto-sugerencias basadas en IA
- ✅ Códigos QR (generados en backend)
- ✅ Historial de pagos (tabla lista)
- ✅ Bug fixes aplicados

---

## 📞 Soporte

Si algo no funciona después de seguir esta guía:

1. Ejecuta:
   ```powershell
   docker-compose logs > logs_completos.txt
   ```

2. Abre consola del navegador (F12) y captura errores

3. Reporta con:
   - Qué estabas haciendo
   - Qué esperabas que pasara
   - Qué pasó en realidad
   - Screenshot del error
   - logs_completos.txt

---

**Última actualización:** 30 Oct 2025, 16:30  
**Versión del sistema:** 2.0 - Revolutionary Edition  
**Docker:** ✅ RECONSTRUIDO  
**Estado:** ✅ FUNCIONAL
