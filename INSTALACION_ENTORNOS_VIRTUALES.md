# 🔒 Guía de Instalación con Entornos Virtuales

## ¿Por qué usar entornos virtuales?

Los entornos virtuales mantienen todas las dependencias **aisladas** en tu proyecto, sin instalar nada globalmente en tu PC. Esto te da:

✅ **Seguridad**: No contamina tu sistema con paquetes
✅ **Portabilidad**: Puedes mover o eliminar el proyecto sin dejar rastros
✅ **Aislamiento**: Cada proyecto tiene sus propias versiones de librerías
✅ **Limpieza**: Todo está contenido en carpetas locales

---

## 📦 Estructura de Entornos Virtuales

```
empenio/
├── venv/                          # ← Entorno virtual de Python (aislado)
│   ├── Scripts/                   # ← Ejecutables de Python aislados
│   └── Lib/                       # ← Librerías Python aisladas
│
├── server/
│   └── node_modules/              # ← Dependencias Node.js locales (no globales)
│
├── client/
│   └── node_modules/              # ← Dependencias React locales (no globales)
│
└── ia_module/
    └── (usa venv/ del raíz)       # ← Usa el entorno virtual de Python
```

---

## 🚀 Instalación Paso a Paso

### 1️⃣ Requisitos Previos

Necesitas tener instalado **SOLO**:
- **Node.js** (versión 14 o superior) - [Descargar aquí](https://nodejs.org/)
- **Python** (versión 3.8 o superior) - [Descargar aquí](https://www.python.org/)

**IMPORTANTE**: No necesitas instalar npm, pip ni ningún paquete globalmente. Todo se instalará localmente.

### 2️⃣ Ejecutar Instalación

Simplemente ejecuta:

```cmd
install.bat
```

Esto hará **automáticamente**:

1. ✅ Crear entorno virtual Python en `venv/`
2. ✅ Instalar dependencias backend en `server/node_modules/`
3. ✅ Instalar dependencias frontend en `client/node_modules/`
4. ✅ Instalar librerías Python en `venv/Lib/`
5. ✅ Entrenar modelo de IA dentro del entorno virtual

**Total de tiempo**: 3-5 minutos (dependiendo de tu conexión)

---

## ▶️ Iniciar el Sistema

Una vez instalado, ejecuta:

```cmd
start.bat
```

Esto iniciará **tres servicios** en ventanas separadas:

1. **Backend API** → Puerto 5000 (usando Node.js local)
2. **Módulo de IA** → Puerto 5001 (usando `venv/Scripts/python.exe`)
3. **Frontend React** → Puerto 3000 (usando Node.js local)

Luego abre tu navegador en: **http://localhost:3000**

---

## 🔍 Verificar Entornos Virtuales

### Verificar Python Virtual Environment

```cmd
# Ver qué Python se está usando (debe apuntar a venv/)
venv\Scripts\python.exe --version

# Ver paquetes instalados SOLO en el entorno virtual
venv\Scripts\pip.exe list
```

**Salida esperada**:
```
Package           Version
----------------- --------
Flask             2.3.3
scikit-learn      1.3.2
pandas            2.1.0
numpy             1.24.3
joblib            1.3.2
```

### Verificar Node.js Local

```cmd
# Ver dependencias del backend (NO están en C:\Users\...\AppData\)
dir server\node_modules

# Ver dependencias del frontend
dir client\node_modules
```

Ambas carpetas `node_modules` están **dentro del proyecto**, no en tu sistema.

---

## 🧹 Desinstalación Completa

Para eliminar TODO sin dejar rastros en tu PC:

### Opción 1: Eliminar Carpetas Manualmente

```cmd
# Eliminar entorno virtual de Python
rmdir /s /q venv

# Eliminar dependencias Node.js
rmdir /s /q server\node_modules
rmdir /s /q client\node_modules

# Eliminar modelo entrenado
del ia_module\*.pkl

# Eliminar base de datos
del server\empenios.db
```

### Opción 2: Eliminar TODO el Proyecto

Simplemente borra la carpeta `empenio/` completa. No quedará nada instalado en tu PC.

---

## ❓ Preguntas Frecuentes

### ¿Por qué npm dice "no se reconoce como comando"?

**Solución**: Instala Node.js desde https://nodejs.org/. Asegúrate de marcar la opción "Add to PATH" durante la instalación.

### ¿Cómo sé que NO se instaló globalmente?

Verifica que estas carpetas **NO existan** o **NO tengan** nuevos paquetes:

```cmd
# NO debería tener flask, scikit-learn, etc.
dir %APPDATA%\Python\

# NO debería tener express, react, etc. 
dir %APPDATA%\npm\
```

### ¿Puedo mover el proyecto a otra carpeta?

✅ **Sí**, simplemente mueve toda la carpeta `empenio/`. Luego ejecuta `install.bat` de nuevo en la nueva ubicación.

### ¿Qué pasa si borro venv/?

No hay problema. Ejecuta `install.bat` y se recreará automáticamente.

### ¿Cómo actualizar dependencias?

```cmd
# Actualizar Python packages
venv\Scripts\python.exe -m pip install --upgrade -r ia_module\requirements.txt

# Actualizar Node.js packages
cd server
npm update
cd ..\client
npm update
```

---

## 🔧 Solución de Problemas

### Error: "python no se reconoce como comando"

**Causa**: Python no está en el PATH del sistema

**Solución**:
1. Reinstala Python desde https://www.python.org/
2. Marca la opción **"Add Python to PATH"** durante la instalación
3. Reinicia tu terminal

### Error: "Error al crear el entorno virtual de Python"

**Causa**: Módulo `venv` no instalado

**Solución**:
```cmd
python -m pip install --upgrade pip
python -m ensurepip
```

### Error: "ENOENT: no such file or directory"

**Causa**: Ruta muy larga en Windows

**Solución**:
1. Mueve el proyecto a `C:\empenio\` (ruta más corta)
2. O habilita rutas largas en Windows:
   ```cmd
   reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1
   ```

### Los puertos están ocupados

**Solución**:
```cmd
# Ver qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Matar proceso (reemplaza PID con el número que apareció)
taskkill /PID <PID> /F
```

---

## 📊 Comparación: Global vs Local

| Aspecto | Instalación Global | Instalación Local (Este Proyecto) |
|---------|-------------------|-----------------------------------|
| Ubicación Python | `C:\Users\...\AppData\` | `empenio\venv\` |
| Ubicación Node.js | `C:\Program Files\nodejs\` | `empenio\server\node_modules\` |
| Eliminar proyecto | ❌ Deja rastros en sistema | ✅ Borra carpeta y listo |
| Conflictos versiones | ❌ Puede romper otros proyectos | ✅ Completamente aislado |
| Portabilidad | ❌ Difícil mover | ✅ Mueve carpeta y funciona |
| Espacio en disco | ❌ Disperso en sistema | ✅ Todo en una carpeta |

---

## 🎓 Para Entregar como Proyecto Académico

Si vas a presentar esto como proyecto, puedes incluir esta guía para demostrar:

✅ **Buenas prácticas** de desarrollo profesional
✅ **Seguridad** al no contaminar el sistema
✅ **Reproducibilidad** del entorno de desarrollo
✅ **Profesionalismo** en la gestión de dependencias

---

## 📝 Notas Finales

- **Tamaño total del proyecto instalado**: ~500 MB (todo local)
- **Tiempo de instalación inicial**: 3-5 minutos
- **Tiempo de inicio del sistema**: 10-15 segundos
- **RAM requerida**: ~1 GB para los tres servicios

---

**¿Dudas?** Consulta los otros archivos de documentación:
- `README.md` - Documentación general
- `QUICKSTART.md` - Inicio rápido
- `TECHNICAL.md` - Detalles técnicos
- `USER_MANUAL.md` - Manual de usuario
