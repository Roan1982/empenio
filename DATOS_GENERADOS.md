# 📊 Base de Datos Poblada - 40 Usuarios

## ✅ Datos Generados Exitosamente

La base de datos ha sido poblada con datos aleatorios realistas para visualizar la aplicación funcionando con contenido completo.

### 📈 Resumen de Datos

- **40 usuarios** con nombres, emails, DNIs y teléfonos únicos
- **~80 objetos** (electrónica, joyería, herramientas, instrumentos)
- **~80 precotizaciones** con valores estimados por IA
- **~48 citas** (pendientes, confirmadas, canceladas, completadas)
- **~23 empeños** activos, vencidos y pagados con códigos QR
- **~33 pagos** de intereses y totales
- **~80 notificaciones** para usuarios

---

## 👥 Usuarios de Prueba

### 🔑 Cuenta Administrador

```
Email: admin@empenio.com
Password: admin123
```

### 👤 Cuentas de Usuario (Primeros 10)

Todos los usuarios tienen la **misma contraseña: `password123`**

| Nombre | Email |
|--------|-------|
| Pablo Álvarez | pablo.alvarez852@outlook.com |
| Juan Martínez | juan.martinez438@gmail.com |
| Laura Hernández | laura.hernandez587@gmail.com |
| Andrea Ramírez | andrea.ramirez436@yahoo.com |
| Pablo Ramírez | pablo.ramirez80@yahoo.com |
| Marta Hernández | marta.hernandez143@outlook.com |
| Daniel Vega | daniel.vega240@hotmail.com |
| Alberto Rodríguez | alberto.rodriguez289@hotmail.com |
| Francisco Torres | francisco.torres191@yahoo.com |
| Carlos Morales | carlos.morales147@hotmail.com |

*(y 30 usuarios más con diferentes combinaciones de nombres y apellidos)*

---

## 🎯 Qué Puedes Visualizar en la App

### Como Administrador

1. **Dashboard con Estadísticas Reales**
   - Total de empeños activos
   - Montos prestados
   - Citas del día
   - Notificaciones pendientes

2. **Gestión de Usuarios**
   - Lista de 40 usuarios registrados
   - Información completa de contacto
   - Historial de cada usuario

3. **Gestión de Empeños**
   - ~23 empeños con diferentes estados
   - Códigos QR generados (EMP-000001, EMP-000002, etc.)
   - Valores de avalúo, montos prestados, intereses
   - Fechas de vencimiento

4. **Gestión de Citas**
   - ~48 citas en diferentes estados
   - Horarios distribuidos entre 9:00 AM y 5:30 PM
   - Relacionadas con precotizaciones

5. **Gestión de Pagos**
   - ~33 pagos registrados
   - Diferentes métodos: efectivo, tarjeta, transferencia
   - Pagos de intereses y totales

6. **Notificaciones**
   - 80+ notificaciones distribuidas
   - Campana 🔔 con badge contador
   - Notificaciones leídas y no leídas

### Como Usuario

1. **Dashboard Personal**
   - Mis citas programadas
   - Mis empeños activos
   - Pagos pendientes
   - Notificaciones personales

2. **Historial de Cotizaciones**
   - Ver precotizaciones realizadas
   - Valores estimados por IA
   - Confiabilidad del análisis

3. **Mis Empeños**
   - Lista de empeños activos y vencidos
   - Detalles de objetos empeñados
   - Fechas de vencimiento
   - Opción de renovación

4. **Notificaciones Personalizadas**
   - 2 notificaciones por usuario
   - Recordatorios de pagos
   - Confirmaciones de citas
   - Alertas de vencimiento

---

## 📦 Tipos de Objetos Generados

### Electrónica
- Laptops (HP, Dell, Lenovo, Acer)
- Smartphones (iPhone, Samsung, Xiaomi, Huawei)
- Tablets (iPad, Samsung Tab, Lenovo Tab)
- TVs (LG, Samsung, Sony)

### Joyería
- Anillos (Oro 18k, Platino, Plata 925)
- Collares (Oro, Plata)
- Relojes (Rolex, Omega, TAG Heuer)

### Herramientas
- Taladros (Bosch, DeWalt, Makita)
- Sierras (Bosch, Stanley, DeWalt)
- Compresores (Truper, DeWalt, Porter)

### Instrumentos Musicales
- Guitarras (Fender, Gibson, Yamaha)
- Bajos (Fender, Ibanez, Music Man)

---

## 🔢 Estadísticas de los Datos

### Valores Monetarios
- **Valores de objetos:** Entre $500 y $50,000
- **Montos prestados:** 70% del valor del objeto
- **Tasas de interés:** Entre 3% y 7% mensual
- **Plazos:** 30, 60 o 90 días

### Estados de Empeños
- **Activos:** Mayor cantidad (usuarios pueden pagar)
- **Vencidos:** Algunos para simular alertas
- **Pagados:** Algunos completados exitosamente
- **Renovados:** Con renovaciones de 0 a 2 veces

### Estados de Citas
- **Pendientes:** Esperando confirmación
- **Confirmadas:** Listas para ejecutar
- **Canceladas:** Algunas canceladas
- **Completadas:** Ya realizadas

---

## 🚀 Cómo Usar los Datos

1. **Inicia sesión como admin** para ver el panel completo:
   ```
   http://localhost:3000
   admin@empenio.com / admin123
   ```

2. **Prueba funcionalidades de usuario**:
   - Usa cualquier email de la lista
   - Password: `password123`
   - Explora dashboard, notificaciones, empeños

3. **Prueba el flujo completo**:
   - Crear nuevas cotizaciones
   - Agendar citas
   - Crear empeños desde citas confirmadas
   - Registrar pagos
   - Ver notificaciones en tiempo real

4. **Visualiza estadísticas**:
   - Gráficas con datos reales
   - Reportes con información variada
   - Filtros por estado, fecha, usuario

---

## 🔄 Regenerar Datos

Si necesitas regenerar los datos con nuevos valores aleatorios:

```bash
docker exec empenio-backend-1 node seed-40-usuarios.js
```

Este comando:
- Limpia los datos anteriores (excepto admin)
- Crea 40 nuevos usuarios con datos random
- Genera todos los objetos, citas, empeños, pagos y notificaciones relacionadas

---

## 📝 Notas Importantes

- Los emails **NO** contienen caracteres especiales (sin tildes) para evitar errores de validación
- Los nombres **SÍ** pueden tener tildes (Pablo Álvarez, Juan Martínez, etc.)
- Los DNIs son únicos de 8 dígitos
- Los teléfonos siguen formato colombiano: +57 300-399 XXX XXXX
- Los códigos QR de empeños siguen formato: EMP-XXXXXX
- Las fechas están distribuidas entre septiembre 2024 y diciembre 2025
- Los horarios de citas son entre 9:00 AM y 5:30 PM

---

## ✨ Características Destacadas

- ✅ Datos completamente aleatorios pero coherentes
- ✅ Relaciones entre tablas correctamente establecidas
- ✅ Estados distribuidos de manera realista
- ✅ Valores monetarios dentro de rangos lógicos
- ✅ Notificaciones contextuales por tipo de evento
- ✅ Historial de pagos para empeños activos
- ✅ Códigos QR únicos para cada empeño

---

**🎉 ¡Disfruta explorando tu aplicación con datos realistas!**
