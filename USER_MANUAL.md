# 📸 Manual de Usuario - Sistema de Empeños Inteligente

## Contenido

1. [Registro e Inicio de Sesión](#1-registro-e-inicio-de-sesión)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Solicitar Pre-Cotización con IA](#3-solicitar-pre-cotización-con-ia)
4. [Gestionar Mis Empeños](#4-gestionar-mis-empeños)
5. [Coordinar Citas](#5-coordinar-citas)
6. [Panel de Administración](#6-panel-de-administración)

---

## 1. Registro e Inicio de Sesión

### Pantalla de Login

**Ubicación**: `http://localhost:3000/login`

**Elementos**:
- Logo "💎 Empeño Inteligente"
- Campo de email
- Campo de contraseña
- Checkbox "Ingresar como administrador"
- Botón "Iniciar Sesión"
- Link "¿No tienes cuenta? Regístrate aquí"

**Credenciales de prueba (Admin)**:
- Email: `admin@empenio.com`
- Password: `admin123`
- ✅ Marcar checkbox de admin

### Pantalla de Registro

**Ubicación**: `http://localhost:3000/register`

**Campos requeridos**:
- Nombre completo
- DNI (único)
- Email (único)
- Teléfono de contacto
- Contraseña (mín. 6 caracteres)
- Confirmar contraseña

**Validaciones**:
- ✅ Email válido
- ✅ DNI único
- ✅ Contraseñas coinciden
- ✅ Todos los campos completos

---

## 2. Dashboard Principal

### Vista de Usuario

**Ubicación**: `http://localhost:3000/dashboard`

**Secciones**:

#### A. Header
- Logo del sistema
- Avatar con inicial del nombre
- Nombre y email del usuario
- Botón "Cerrar Sesión"

#### B. Estadísticas (Cards)

1. **📦 Empeños Activos**
   - Número de empeños vigentes
   - Color: Azul (primary)

2. **💰 Total Prestado**
   - Suma de montos activos
   - Color: Verde (success)

3. **📋 Cotizaciones Pendientes**
   - Pre-cotizaciones sin cita
   - Color: Amarillo (warning)

4. **📅 Citas Programadas**
   - Citas confirmadas o pendientes
   - Color: Azul claro (info)

#### C. Acciones Rápidas

1. **🔍 Solicitar Pre-Cotización**
   - Icono grande de búsqueda
   - Descripción: "Obtén una estimación del valor de tu objeto con IA"
   - Link: `/solicitar-cotizacion`

2. **📦 Mis Empeños**
   - Icono de caja
   - Descripción: "Ver estado de tus empeños y renovar préstamos"
   - Link: `/mis-empenos`

3. **📅 Mis Citas**
   - Icono de calendario
   - Descripción: "Gestionar citas programadas para empeñar objetos"
   - Link: `/mis-citas`

4. **📊 Historial** (próximamente)
   - Icono de gráfico
   - Estado: Deshabilitado
   - Descripción: "Ver historial completo de empeños anteriores"

#### D. Información Importante

**Card con lista**:
- ✅ Pre-cotización online: Envía fotos y descripción
- 🤖 IA automática: Estimación inmediata del valor
- 📅 Cita previa: Coordina tu visita
- ⏰ Plazo: 30 días para recuperar tu objeto
- 🔄 Renovación: Paga solo el interés y extiende 30 días

---

## 3. Solicitar Pre-Cotización con IA

### Paso 1: Formulario de Objeto

**Ubicación**: `http://localhost:3000/solicitar-cotizacion`

**Formulario**:

#### Información del Objeto

1. **Tipo de Objeto*** (select)
   - 📱 Celular
   - 💻 Notebook
   - 📲 Tablet
   - ⌚ Reloj
   - 📺 Televisor
   - 🎮 Consola
   - 💍 Joya

2. **Marca*** (input text)
   - Ejemplo: Samsung, Apple, Lenovo, etc.

3. **Modelo** (input text opcional)
   - Ejemplo: Galaxy S21, iPhone 13

4. **Estado*** (select)
   - ✨ Nuevo
   - 👍 Usado (Buen estado)
   - ⚠️ Deteriorado

5. **Antigüedad (años)*** (input number)
   - Ejemplo: 2
   - Min: 0

6. **Descripción Técnica*** (textarea)
   - Características
   - Accesorios incluidos
   - Estado general
   - Problemas conocidos

#### Multimedia

7. **Fotos del Objeto** (máx. 5)
   - Área de drag & drop
   - Icono 📷
   - Formatos: JPG, PNG, GIF
   - Max: 10MB por archivo
   - Preview con botón X para eliminar

8. **Video Funcionando** (opcional)
   - Input file
   - Formatos: MP4, MOV, AVI
   - Muestra nombre del archivo seleccionado

**Botón**: "🚀 Obtener Pre-Cotización"

### Paso 2: Resultado de la IA

**Pantalla de éxito**:

#### Header
- Icono ✅ grande
- Título: "¡Pre-cotización Completada!"
- Mensaje: "Nuestra IA ha analizado tu objeto y generó una estimación"

#### Estadísticas (4 cards)

1. **💰 Valor Estimado**
   - Valor del objeto según IA
   - Ejemplo: $90,000

2. **💵 Monto Préstamo (70%)**
   - 70% del valor estimado
   - Ejemplo: $63,000

3. **📈 Interés Mensual (15%)**
   - 15% del monto prestado
   - Ejemplo: $9,450

4. **🎯 Confiabilidad**
   - Porcentaje de certeza de la IA
   - Ejemplo: 92%

#### Detalles del Préstamo

**Card informativa**:
- 📋 Plazo: 30 días
- 💰 Monto total a pagar: $72,450
- 🔄 Renovación: Paga solo $9,450 y extiende 30 días
- 📝 Sin verificación: Solo con tu DNI

#### Acciones
- **Botón primario**: "📅 Coordinar Cita"
- **Botón secundario**: "🏠 Volver al Inicio"

---

## 4. Gestionar Mis Empeños

**Ubicación**: `http://localhost:3000/mis-empenos`

### Vista con Empeños

**Grid de cards** (2 columnas en desktop, 1 en mobile):

#### Card de Empeño

**Header**:
- Título: "Celular Samsung" (tipo + marca)
- Badge de estado:
  - 🟢 "Activo" (más de 7 días)
  - 🟡 "Por vencer" (7 días o menos)
  - 🔴 "Vencido" (fecha pasada)

**Descripción**:
- Texto breve del objeto

**Panel de información** (fondo gris claro):
- **Monto Prestado**: $63,000 (azul)
- **Interés Mensual**: $9,450 (amarillo)
- **Total a Pagar**: $72,450 (verde)
- **Días Restantes**: 15 días (azul/rojo según urgencia)

**Fechas**:
- 📅 Inicio: 01/10/2025
- ⏰ Vencimiento: 31/10/2025
- 🔄 Renovaciones: 0

**Botones**:
- **🔄 Renovar ($9,450)**: Verde
  - Paga solo el interés
  - Extiende 30 días más
- **✅ Pagar Total**: Azul
  - Finaliza el empeño
  - Permite retirar objeto

### Vista sin Empeños

**Empty state**:
- Icono 📦 grande (opacidad 30%)
- Título: "No tienes empeños activos"
- Mensaje: "Solicita una pre-cotización para comenzar"
- Botón: "🔍 Solicitar Pre-Cotización"

---

## 5. Coordinar Citas

**Ubicación**: `http://localhost:3000/mis-citas`

### Header de Página
- Título: "📅 Mis Citas"
- Descripción: "Coordina y gestiona tus citas para empeñar objetos"
- Botón: "+ Nueva Cita" (esquina superior derecha)

### Tabla de Citas

**Columnas**:
1. **Fecha**: 15/10/2025
2. **Hora**: 14:00
3. **Objeto**: Celular Samsung Galaxy
4. **Valor Estimado**: $90,000
5. **Estado**: Badge (Pendiente/Confirmada/Cancelada)
6. **Acciones**: Botón "Cancelar" (solo si pendiente)

**Estados de cita**:
- 🟡 **Pendiente**: Esperando confirmación
- 🟢 **Confirmada**: Admin confirmó
- 🔴 **Cancelada**: Cita cancelada

### Modal: Nueva Cita

**Trigger**: Click en "+ Nueva Cita" o después de cotización

**Campos**:

1. **Fecha*** (date picker)
   - Mínimo: Hoy
   - Formato: DD/MM/YYYY

2. **Hora*** (select)
   - Horarios cada 30 min
   - Rango: 09:00 - 18:00
   - Ejemplo: 09:00, 09:30, 10:00, ...

3. **Notas adicionales** (textarea opcional)
   - Información extra
   - Requerimientos especiales

**Si viene de cotización**:
- Muestra card con resumen:
  - 💰 Pre-cotización: $90,000
  - 📦 Monto préstamo: $63,000

**Botones**:
- "Cancelar": Cierra modal
- "Solicitar Cita": Envía formulario

### Vista sin Citas

**Empty state**:
- Icono 📅 grande
- Título: "No tienes citas programadas"
- Mensaje: "Solicita una cita para concretar tu empeño"
- Botón: "📅 Solicitar Cita"

---

## 6. Panel de Administración

**Ubicación**: `http://localhost:3000/admin`

**Acceso**: Solo usuarios con rol "admin"

### Header Admin
- Logo: "💎 Panel Administrativo"
- Avatar: 👨‍💼
- Nombre: Admin
- Rol: "Administrador"

### Navegación por Tabs

**Botones de tab**:
- **📅 Citas** (activo por defecto)
- **📦 Empeños**

---

### Tab 1: Citas

**Título**: "Citas Programadas (15)"

**Tabla**:

**Columnas**:
1. **Usuario**: Juan Pérez
2. **DNI**: 12345678
3. **Contacto**: +54 9 11 1234-5678
4. **Fecha**: 15/10/2025
5. **Hora**: 14:00
6. **Objeto**: Celular Samsung
7. **Valor**: $90,000
8. **Estado**: Badge
9. **Acciones**: Botón "Confirmar" (si pendiente)

**Funcionalidad**:
- Ver todas las citas del sistema
- Filtrar por estado
- Confirmar citas pendientes
- Acceder a datos de contacto

---

### Tab 2: Empeños

**Título**: "Empeños Registrados (8)"

**Tabla**:

**Columnas**:
1. **Usuario**: María García
2. **DNI**: 87654321
3. **Objeto**: Notebook Lenovo
4. **Monto**: $210,000
5. **Interés**: $31,500
6. **Inicio**: 01/10/2025
7. **Vencimiento**: 31/10/2025
8. **Renovaciones**: 1
9. **Estado**: Badge (Activo/Finalizado)

**Funcionalidad**:
- Ver todos los empeños del sistema
- Monitorear vencimientos
- Estadísticas generales
- Control de renovaciones

---

## Flujos de Uso Comunes

### Flujo 1: Primer Empeño

```
1. Usuario se registra
   ↓
2. Completa perfil
   ↓
3. Solicita pre-cotización
   - Sube fotos
   - Completa descripción
   ↓
4. IA analiza y muestra valor
   ↓
5. Coordina cita
   - Selecciona fecha/hora
   ↓
6. Admin confirma cita
   ↓
7. Usuario lleva objeto
   ↓
8. Se crea empeño en sistema
   ↓
9. Usuario recibe dinero
```

### Flujo 2: Renovación de Empeño

```
1. Usuario ve "Mis Empeños"
   ↓
2. Identifica empeño por vencer
   ↓
3. Click en "🔄 Renovar"
   ↓
4. Confirma pago de interés
   ↓
5. Sistema extiende 30 días
   ↓
6. Usuario tiene más tiempo
```

### Flujo 3: Finalizar Empeño

```
1. Usuario junta dinero completo
   ↓
2. Ve "Mis Empeños"
   ↓
3. Click en "✅ Pagar Total"
   ↓
4. Confirma pago
   ↓
5. Sistema marca como finalizado
   ↓
6. Usuario puede retirar objeto
```

---

## Tips y Mejores Prácticas

### Para Usuarios

✅ **Fotos de calidad**:
- Buena iluminación
- Múltiples ángulos
- Detalles importantes
- Incluye accesorios

✅ **Descripción completa**:
- Estado real del objeto
- Problemas conocidos
- Accesorios incluidos
- Garantía vigente

✅ **Planificación**:
- Coordina cita con anticipación
- Lleva DNI original
- Verifica monto antes de la cita

### Para Administradores

✅ **Gestión de citas**:
- Confirma rápidamente
- Verifica disponibilidad
- Contacta por teléfono si es necesario

✅ **Control de empeños**:
- Monitorea vencimientos
- Contacta usuarios próximos a vencer
- Registra renovaciones correctamente

---

## Soporte y Ayuda

### Contacto
- 📧 Email: soporte@empenio.com
- 📱 WhatsApp: +54 9 11 xxxx-xxxx
- 🕐 Horario: Lunes a Viernes 9:00 - 18:00

### Preguntas Frecuentes

**¿Cuánto tarda la IA en analizar?**
- Entre 2-5 segundos normalmente

**¿Puedo modificar la cotización?**
- No, pero puedes solicitar revisión manual

**¿Cuántas veces puedo renovar?**
- Sin límite, siempre que pagues el interés

**¿Qué pasa si no pago?**
- El objeto queda en guarda hasta que pagues

---

**¡Sistema completo y fácil de usar! 🎉**
