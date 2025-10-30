# 🚀 Guía de Inicio Rápido

## Instalación Automática

### Windows
```bash
install.bat
```

### Linux/Mac
```bash
chmod +x install.sh
./install.sh
```

## Iniciar el Sistema

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

## Acceso a la Aplicación

Una vez iniciados todos los servicios:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **IA API**: http://localhost:5001

## Credenciales de Prueba

### Usuario Normal
- Crear cuenta desde el registro

### Administrador
- **Email**: admin@empenio.com
- **Password**: admin123

## Probar el Sistema

### 1. Registro de Usuario
1. Ve a http://localhost:3000
2. Clic en "Regístrate aquí"
3. Completa el formulario
4. Inicia sesión

### 2. Solicitar Pre-Cotización
1. Clic en "Solicitar Pre-Cotización"
2. Completa los datos del objeto:
   - Tipo: Celular
   - Marca: Samsung
   - Estado: Usado
   - Antigüedad: 2 años
   - Descripción detallada
3. Sube fotos (opcional pero recomendado)
4. Clic en "Obtener Pre-Cotización"
5. **La IA analizará y mostrará el valor estimado**

### 3. Coordinar Cita
1. Después de la cotización, clic en "Coordinar Cita"
2. Selecciona fecha y hora
3. Agrega notas opcionales
4. Confirma la cita

### 4. Panel de Administrador
1. Cierra sesión
2. Inicia sesión como administrador
3. Marca el checkbox "Ingresar como administrador"
4. Verás todas las citas y empeños del sistema

## Verificar que Todo Funciona

### Backend
```bash
curl http://localhost:5000/api/health
```
Respuesta esperada: `{"status":"ok"}`

### IA Module
```bash
curl http://localhost:5001/health
```
Respuesta esperada: `{"status":"ok"}`

### Frontend
Abrir http://localhost:3000 en el navegador

## Detener el Sistema

### Windows
Cerrar todas las ventanas de terminal

### Linux/Mac
Presionar `Ctrl+C` en cada terminal

## Problemas Comunes

### Puerto ya en uso
Si algún puerto está ocupado, detén el proceso:

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Error de base de datos
Elimina la carpeta `database/` y reinicia el servidor

### Error en módulo de IA
```bash
cd ia_module
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
# Re-entrenar modelo
python train_model.py
```

## Estructura de Prueba

### 1. Flujo Usuario
```
Registro → Login → Solicitar Cotización → Ver Resultado → 
Coordinar Cita → Ver Mis Citas → Ver Mis Empeños
```

### 2. Flujo Administrador
```
Login Admin → Ver Citas Pendientes → Confirmar Cita → 
Ver Empeños Activos → Monitorear Sistema
```

## Datos de Ejemplo

El sistema está pre-cargado con:
- 1 administrador
- Dataset de IA con 40 empeños históricos
- Modelo entrenado listo para usar

## Tecnologías en Acción

- ✅ **React** - UI moderna y responsive
- ✅ **Node.js + Express** - API REST robusta
- ✅ **SQLite** - Base de datos local
- ✅ **Python + Flask** - API de IA
- ✅ **scikit-learn** - Machine Learning
- ✅ **JWT** - Autenticación segura

---

**¡Listo para usar! 🎉**
