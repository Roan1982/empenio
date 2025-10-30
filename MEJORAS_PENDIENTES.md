# 📋 MEJORAS PENDIENTES - SISTEMA DE EMPEÑOS

## ✅ **COMPLETADO**
1. ✅ Endpoint crear empeño manual corregido (`/empenos` y `/empenos/crear`)
2. ✅ Backend reiniciado

## 🔧 **EN PROGRESO**

### 1. **Historial de Usuarios Inactivo**
- **Problema**: El historial siempre aparece inactivo aunque hay empeños
- **Solución**: 
  - Verificar endpoint `/users/:id/historial`
  - Corregir filtro de empeños finalizados/históricos
  - Actualizar componente Dashboard.js

### 2. **Modal Crear Empeño - Error al Guardar**
- **Problema**: "❌ Error al crear empeño: Error desconocido"
- **Solución**: ✅ COMPLETADO - Endpoints corregidos

### 3. **Exportación de Reporte Mensual**
- **Requerimiento**: Exportar a PDF y Excel
- **Implementar**:
  - Botón "📄 Exportar PDF" usando jsPDF + autoTable
  - Botón "📊 Exportar Excel" usando xlsx
  - Agregar a sección Reportes del AdminPanel

### 4. **Detalle de Objetos con Imágenes/Videos**
- **Requerimiento**: Ver detalle completo del objeto
- **Implementar**:
  - Modal DetallObjetoModal.js
  - Mostrar todas las fotos en galería
  - Reproducir videos si los hay
  - Botón "👁️ Ver Detalle" en cada fila de la tabla

### 5. **Exportar Informe de Usuarios**
- **Requerimiento**: Exportar lista de usuarios
- **Implementar**:
  - Botón "📥 Exportar Informe PDF"
  - Documento con tabla de todos los usuarios
  - Incluir estadísticas: empeños activos, deuda total, etc.

### 6. **Filtros y Exportación en Citas**
- **Requerimiento**: Filtrar, ordenar y exportar citas
- **Implementar**:
  - Barra de búsqueda
  - Filtros por estado (pendiente, confirmada, cancelada)
  - Ordenar por fecha
  - Exportar a CSV/PDF

### 7. **Dashboard Mejorado con Gráficos**
- **Requerimiento**: Más métricas útiles y gráficas
- **Implementar**:
  - Gráfico de empeños por mes (Chart.js)
  - Gráfico de ingresos mensuales
  - Top 5 tipos de objetos más empeñados
  - Tasa de renovación vs finalización
  - Empeños por estado (dona)
  - KPIs: Total activo, promedio monto, tasa recuperación

---

## 📦 **LIBRERÍAS NECESARIAS**
```bash
# Frontend
npm install jspdf jspdf-autotable xlsx chart.js react-chartjs-2

# Backend (ya instaladas)
- express
- sqlite3
```

---

## 🎯 **PRIORIDAD DE IMPLEMENTACIÓN**
1. 🔴 ALTA: Historial usuarios + Error crear empeño (EN PROCESO)
2. 🟡 MEDIA: Detalle objetos con imágenes
3. 🟡 MEDIA: Filtros y exportación en Citas
4. 🟢 BAJA: Dashboard con gráficos
5. 🟢 BAJA: Exportaciones PDF/Excel reportes e informes
