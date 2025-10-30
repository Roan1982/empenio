# 🚀 Instalación SIN Dependencias Globales

## ⚠️ Problema Técnico

**Node.js y Python REQUIEREN estar instalados en el sistema operativo para funcionar.** No es posible ejecutar una aplicación Node.js o Python sin tener el runtime instalado.

Sin embargo, hay **3 soluciones profesionales** para evitar "contaminar" tu sistema:

---

## 🎯 Opción 1: Docker (RECOMENDADA) 🐳

### **¿Qué es Docker?**
Docker crea "contenedores" aislados con Node.js y Python dentro, sin instalarlos en tu sistema.

### **Requisitos:**
- **SOLO Docker Desktop** (instalación única)
- Descarga: https://www.docker.com/products/docker-desktop/

### **Ventajas:**
✅ Node.js y Python SOLO dentro de contenedores
✅ Cero conflictos con otros proyectos
✅ Eliminas todo con `docker-compose down --volumes`
✅ Entorno idéntico en cualquier PC
✅ Producción-ready

### **Instalación:**

1. **Instalar Docker Desktop** (única instalación necesaria)
2. **Ejecutar:**
   ```cmd
   docker-start.bat
   ```

3. **¡Listo!** Abre http://localhost:3000

### **Desinstalar TODO:**
```cmd
docker-compose down --volumes --rmi all
```

Esto elimina:
- Contenedores
- Volúmenes
- Imágenes Docker
- Node.js y Python (estaban SOLO en contenedores)

---

## 🎯 Opción 2: Node.js y Python Portables

### **¿Qué son versiones portables?**
Versiones "sin instalador" que se ejecutan desde una carpeta, sin tocar el registro de Windows.

### **Pasos:**

#### **1. Descargar Node.js Portable**
- Sitio: https://nodejs.org/dist/v18.18.0/node-v18.18.0-win-x64.zip
- Descomprimir en: `empenio/portable/nodejs/`

#### **2. Descargar Python Portable**
- Sitio: https://www.python.org/ftp/python/3.11.6/python-3.11.6-embed-amd64.zip
- Descomprimir en: `empenio/portable/python/`

#### **3. Usar scripts especiales:**

He creado scripts que usan las versiones portables:

```cmd
install-portable.bat
start-portable.bat
```

### **Estructura:**
```
empenio/
├── portable/
│   ├── nodejs/              ← Node.js portable aquí
│   │   ├── node.exe
│   │   └── npm.cmd
│   └── python/              ← Python portable aquí
│       └── python.exe
├── install-portable.bat     ← Instala con portables
└── start-portable.bat       ← Inicia con portables
```

---

## 🎯 Opción 3: Máquina Virtual (Más pesada)

### **Concepto:**
Instalar una VM con Linux y ejecutar todo ahí.

### **Herramientas:**
- VirtualBox + Ubuntu
- VMware Workstation Player
- Hyper-V (Windows Pro)

### **Ventajas:**
✅ Aislamiento TOTAL del sistema host
✅ Puedes destruir la VM cuando termines

### **Desventajas:**
❌ Requiere 4-8 GB RAM
❌ Configuración más compleja
❌ Más lenta que Docker

---

## 📊 Comparación de Opciones

| Característica | Docker | Portables | VM |
|----------------|--------|-----------|-----|
| **Instalación global** | Solo Docker Desktop | Nada | Solo VirtualBox |
| **Dificultad** | ⭐⭐ (Media) | ⭐⭐⭐ (Alta) | ⭐⭐⭐⭐ (Muy Alta) |
| **Rendimiento** | ⚡ Rápido | ⚡ Rápido | 🐢 Lento |
| **RAM requerida** | 2-3 GB | 1 GB | 4-8 GB |
| **Portabilidad** | ✅ Excelente | ✅ Buena | ❌ Limitada |
| **Limpieza** | ✅ Perfecta | ⚠️ Manual | ✅ Perfecta |
| **Recomendado para** | Desarrollo profesional | Proyectos académicos | Testing/Investigación |

---

## 🏆 Recomendación Final

### **Para tu caso (proyecto académico):**

**🥇 OPCIÓN 1: Docker** (si tienes 8GB+ RAM)
- Profesional
- Fácil de limpiar
- Impresionará en la presentación

**🥈 OPCIÓN 2: Portables** (si tienes 4GB RAM o menos)
- Funcional
- No requiere Docker
- Más control manual

---

## 🚀 Guía Rápida: Docker

### **1. Instalar Docker Desktop**
Descarga e instala desde: https://www.docker.com/products/docker-desktop/

Durante la instalación:
- ✅ Marca "Use WSL 2" (recomendado)
- ✅ Marca "Add shortcut to desktop"

### **2. Reiniciar tu PC**
Docker requiere reinicio después de instalar.

### **3. Verificar instalación**
Abre PowerShell:
```powershell
docker --version
```

Deberías ver algo como: `Docker version 24.0.6`

### **4. Ejecutar el proyecto**
```cmd
cd C:\Users\angel.steklein\Documents\desarrollo\empenio
docker-start.bat
```

### **5. Abrir aplicación**
Espera 2-3 minutos (primera vez) y abre:
http://localhost:3000

### **6. Limpiar TODO cuando termines**
```cmd
docker-compose down --volumes --rmi all
docker system prune -a
```

Esto libera TODO el espacio usado por Docker.

---

## 🛠️ Guía Rápida: Portables

### **1. Crear carpeta portable**
```cmd
mkdir portable\nodejs
mkdir portable\python
```

### **2. Descargar Node.js Portable**
- URL: https://nodejs.org/dist/v18.18.0/node-v18.18.0-win-x64.zip
- Extraer a: `empenio\portable\nodejs\`

### **3. Descargar Python Portable**
- URL: https://www.python.org/ftp/python/3.11.6/python-3.11.6-embed-amd64.zip
- Extraer a: `empenio\portable\python\`

### **4. Descargar get-pip.py**
- URL: https://bootstrap.pypa.io/get-pip.py
- Guardar en: `empenio\portable\python\`

### **5. Instalar pip en Python portable**
```cmd
portable\python\python.exe portable\python\get-pip.py
```

### **6. Ejecutar instalación**
```cmd
install-portable.bat
```

---

## ❓ Preguntas Frecuentes

### **¿Por qué no puedo ejecutar sin Node.js/Python?**
Porque Node.js y Python son **intérpretes/runtimes** necesarios para ejecutar código JavaScript y Python. Es como querer reproducir un video sin tener un reproductor de video.

### **¿Docker realmente no instala nada en mi sistema?**
Docker Desktop sí se instala, PERO Node.js y Python viven SOLO dentro de contenedores. Cuando eliminas los contenedores, desaparecen.

### **¿Cuál es la más "limpia"?**
1. **Docker**: Eliminas todo con un comando
2. **Portables**: Borras la carpeta `portable/`
3. **VM**: Eliminas la máquina virtual

### **¿Y si solo quiero instalar Node.js y Python normalmente?**
Es la opción MÁS SIMPLE y RÁPIDA. Ocupa ~500 MB y se desinstala fácilmente desde "Panel de Control > Programas".

---

## 📝 Conclusión

**No existe forma de ejecutar Node.js/Python sin tenerlos instalados de alguna manera.**

Tus opciones son:
1. ✅ Instalarlos normalmente (más fácil)
2. ✅ Usar Docker (profesional, aislado)
3. ✅ Usar versiones portables (control total)
4. ✅ Usar máquina virtual (máximo aislamiento)

**Mi recomendación:** Si es para un proyecto académico temporal, instala Node.js y Python normalmente. Cuando termines, desinstálalos. Es lo más simple y funcional.

Si quieres impresionar con conocimientos de DevOps, usa Docker.

---

## 📞 ¿Cuál prefieres?

Responde con:
- **"Docker"** → Te guío con Docker Desktop
- **"Portable"** → Creo los scripts para versiones portables
- **"Normal"** → Te ayudo a instalar Node.js y Python (desinstalables después)
- **"VM"** → Te guío con una máquina virtual Linux

