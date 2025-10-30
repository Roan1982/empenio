# 🚀 INICIO RÁPIDO - Lee Esto Primero

## ❓ ¿Qué tengo instalado en mi PC?

**No sabes qué tienes instalado?** Ejecuta esto:

```cmd
iniciar.bat
```

Este script detectará automáticamente qué herramientas tienes y te dirá qué hacer.

---

## 🎯 Rutas de Instalación

```
┌─────────────────────────────────────────┐
│  ¿QUÉ MÉTODO DE INSTALACIÓN PREFIERES?  │
└─────────────────────────────────────────┘
              │
              ├─────────────────────────────────────────────────┐
              │                                                 │
              │                                                 │
    ┌─────────▼─────────┐                          ┌───────────▼──────────┐
    │ MÁS FÁCIL Y RÁPIDO│                          │  MÁS PROFESIONAL     │
    │                   │                          │  (Contenedores)      │
    │  Node.js + Python │                          │                      │
    │    (Normal)       │                          │  Docker Desktop      │
    └─────────┬─────────┘                          └───────────┬──────────┘
              │                                                 │
              │                                                 │
    ┌─────────▼──────────────────────────────┐    ┌───────────▼──────────────────────────┐
    │ 1. Instalar Node.js + Python           │    │ 1. Instalar Docker Desktop          │
    │    https://nodejs.org/                 │    │    https://docker.com/              │
    │    https://python.org/                 │    │                                     │
    │                                        │    │ 2. Reiniciar PC                     │
    │ 2. Marcar "Add to PATH" al instalar   │    │                                     │
    │                                        │    │ 3. Ejecutar:                        │
    │ 3. Reiniciar terminal                  │    │    docker-start.bat                 │
    │                                        │    │                                     │
    │ 4. Ejecutar:                           │    │ ✓ Node.js y Python SOLO             │
    │    install.bat                         │    │   en contenedores                   │
    │    start.bat                           │    └─────────────────────────────────────┘
    │                                        │
    │ 5. Abrir: http://localhost:3000       │
    │                                        │
    │ ✓ Desinstalable desde                 │
    │   Panel de Control                     │
    └────────────────────────────────────────┘
```

---

## 🎬 Opción 1: Instalación Normal (5 minutos)

### **Paso 1: Descargar e Instalar Node.js**

1. Ve a: **https://nodejs.org/**
2. Click en **"Download Node.js (LTS)"**
3. Ejecuta el instalador descargado
4. **IMPORTANTE:** ✅ Marca **"Add to PATH"**
5. Click "Next" → "Next" → "Install"

### **Paso 2: Descargar e Instalar Python**

1. Ve a: **https://www.python.org/**
2. Click en **"Download Python 3.11"**
3. Ejecuta el instalador descargado
4. **IMPORTANTE:** ✅ Marca **"Add Python to PATH"**
5. Click **"Install Now"**

### **Paso 3: Reiniciar Terminal**

Cierra y abre nuevamente PowerShell.

### **Paso 4: Instalar Proyecto**

```cmd
cd C:\Users\angel.steklein\Documents\desarrollo\empenio
install.bat
```

Espera 3-5 minutos mientras se descargan las dependencias.

### **Paso 5: Iniciar Aplicación**

```cmd
start.bat
```

Se abrirán 3 ventanas de terminal y tu navegador en http://localhost:3000

### **Credenciales de Administrador:**
- **Email:** admin@empenio.com
- **Password:** admin123

---

## 🐳 Opción 2: Docker (10 minutos + reinicio)

### **Paso 1: Descargar e Instalar Docker Desktop**

1. Ve a: **https://www.docker.com/products/docker-desktop/**
2. Click en **"Download for Windows"**
3. Ejecuta el instalador
4. ✅ Marca **"Use WSL 2"** (recomendado)
5. Click "Ok" y espera la instalación

### **Paso 2: Reiniciar PC**

Docker requiere reiniciar el sistema.

### **Paso 3: Iniciar Docker Desktop**

1. Busca "Docker Desktop" en el menú inicio
2. Ábrelo y espera que el icono de la ballena se ponga verde
3. Aparecerá "Docker Desktop is running"

### **Paso 4: Ejecutar Aplicación**

```cmd
cd C:\Users\angel.steklein\Documents\desarrollo\empenio
docker-start.bat
```

Primera vez: tarda 5-10 minutos (descarga imágenes)
Siguientes veces: ~30 segundos

### **Paso 5: Abrir Aplicación**

Abre http://localhost:3000

### **Credenciales:**
- **Email:** admin@empenio.com
- **Password:** admin123

---

## 🔧 Opción 3: Versiones Portables (Avanzado)

Lee el archivo: `INSTALACION_SIN_DEPENDENCIAS_GLOBALES.md`

---

## ❌ Problemas Comunes

### ❌ "npm no se reconoce como comando"

**Causa:** Node.js no está en el PATH

**Solución:**
1. Desinstala Node.js (Panel de Control)
2. Reinstala desde https://nodejs.org/
3. **Marca "Add to PATH"** durante la instalación
4. Reinicia tu terminal

### ❌ "python no se reconoce como comando"

**Causa:** Python no está en el PATH

**Solución:**
1. Desinstala Python (Panel de Control)
2. Reinstala desde https://www.python.org/
3. **Marca "Add Python to PATH"** durante la instalación
4. Reinicia tu terminal

### ❌ "Docker no está instalado"

**Solución:**
- Instala Docker Desktop: https://www.docker.com/products/docker-desktop/
- Reinicia tu PC después de instalar

### ❌ "El puerto 3000 ya está en uso"

**Solución:**
```cmd
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <número_PID> /F
```

### ❌ Error al instalar dependencias Python

**Solución:**
```cmd
# Actualizar pip
python -m pip install --upgrade pip

# Intentar instalación nuevamente
cd ia_module
pip install -r requirements.txt
```

---

## 🧹 Desinstalar/Limpiar

### **Si instalaste normalmente:**

1. **Desinstalar Node.js:**
   - Panel de Control → Programas → Desinstalar Node.js

2. **Desinstalar Python:**
   - Panel de Control → Programas → Desinstalar Python

3. **Limpiar archivos del proyecto:**
   ```cmd
   limpiar_instalacion.bat
   ```

### **Si usaste Docker:**

```cmd
# Detener y eliminar contenedores
docker-compose down --volumes --rmi all

# Limpiar Docker completamente
docker system prune -a
```

---

## 📞 ¿Necesitas Ayuda?

### **1. Ejecuta el asistente:**
```cmd
iniciar.bat
```

### **2. Lee la documentación completa:**
- `README.md` - Documentación general
- `QUICKSTART.md` - Inicio rápido
- `INSTALACION_SIN_DEPENDENCIAS_GLOBALES.md` - Opciones avanzadas
- `TECHNICAL.md` - Documentación técnica

### **3. Archivos importantes:**
- `install.bat` - Instala dependencias (método normal)
- `start.bat` - Inicia aplicación (método normal)
- `docker-start.bat` - Inicia con Docker
- `docker-stop.bat` - Detiene Docker
- `limpiar_instalacion.bat` - Limpia instalación local

---

## ✅ Checklist de Instalación

Marca cuando completes cada paso:

### Método Normal:
- [ ] Node.js instalado (verifica: `node --version`)
- [ ] Python instalado (verifica: `python --version`)
- [ ] Ejecutado `install.bat` sin errores
- [ ] Ejecutado `start.bat`
- [ ] Abierto http://localhost:3000
- [ ] Login exitoso con admin@empenio.com

### Método Docker:
- [ ] Docker Desktop instalado
- [ ] PC reiniciada después de instalar Docker
- [ ] Docker Desktop ejecutándose (icono verde)
- [ ] Ejecutado `docker-start.bat`
- [ ] Abierto http://localhost:3000
- [ ] Login exitoso con admin@empenio.com

---

## 🎉 ¡Listo!

Si completaste la instalación, ya puedes usar el sistema:

1. **Usuarios:** Registrarse y solicitar pre-cotizaciones con IA
2. **Administradores:** Gestionar empeños, citas y usuarios

**¡Disfruta tu sistema de empeños inteligente!** 💎
