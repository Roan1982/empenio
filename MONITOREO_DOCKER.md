# 🐳 Monitoreo de Docker - Sistema de Empeños

## ⏱️ Estado Actual

**Última actualización:** Construyendo imágenes...

---

## 📊 Comandos de Monitoreo

### **Ver estado de todos los contenedores:**
```powershell
docker-compose ps
```

### **Ver logs en tiempo real:**
```powershell
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend  
docker-compose logs -f frontend

# Solo IA
docker-compose logs -f ia_module
```

### **Ver uso de recursos:**
```powershell
docker stats
```

### **Verificar salud de los servicios:**
```powershell
# Backend
Invoke-RestMethod http://localhost:5000/api

# IA Module
Invoke-RestMethod http://localhost:5001/health

# Frontend (en navegador)
Start-Process http://localhost:3000
```

---

## 🔍 Verificar Aislamiento

### **Confirmar que Node.js NO está en Windows:**
```powershell
node --version
# Debería dar error: "no se reconoce como comando"
```

### **Confirmar que Node.js SÍ está en Docker:**
```powershell
docker exec empenio-backend-1 node --version
# Debería mostrar: v20.x.x
```

### **Ver procesos dentro del contenedor:**
```powershell
# Backend
docker exec empenio-backend-1 ps aux

# Frontend
docker exec empenio-frontend-1 ps aux

# IA Module
docker exec empenio-ia_module-1 ps aux
```

---

## 🛠️ Solución de Problemas

### **Contenedor no inicia:**
```powershell
# Ver logs del contenedor problemático
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ia_module

# Reconstruir imagen específica
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
docker-compose build --no-cache ia_module
```

### **Puerto ya en uso:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5001

# Matar proceso
taskkill /PID <numero_pid> /F

# O cambiar puertos en docker-compose.yml
```

### **Contenedor se reinicia constantemente:**
```powershell
# Ver logs detallados
docker logs empenio-backend-1 --tail 100
docker logs empenio-frontend-1 --tail 100
docker logs empenio-ia_module-1 --tail 100
```

### **Limpiar y empezar de cero:**
```powershell
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes también
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Limpiar sistema Docker completo
docker system prune -a

# Reconstruir todo
docker-compose build --no-cache
docker-compose up -d
```

---

## 📈 Métricas de Rendimiento

### **Ver consumo de recursos:**
```powershell
docker stats --no-stream
```

### **Inspeccionar contenedor:**
```powershell
docker inspect empenio-backend-1
docker inspect empenio-frontend-1
docker inspect empenio-ia_module-1
```

### **Ver redes Docker:**
```powershell
docker network ls
docker network inspect empenio_empenio_network
```

---

## 🔄 Gestión de Servicios

### **Reiniciar servicios:**
```powershell
# Todos
docker-compose restart

# Individual
docker-compose restart backend
docker-compose restart frontend
docker-compose restart ia_module
```

### **Detener servicios:**
```powershell
# Todos (mantiene contenedores)
docker-compose stop

# Individual
docker-compose stop backend
docker-compose stop frontend
docker-compose stop ia_module
```

### **Iniciar servicios detenidos:**
```powershell
docker-compose start
```

### **Eliminar todo:**
```powershell
# Contenedores + volúmenes + imágenes
docker-compose down -v --rmi all

# Limpiar sistema
docker system prune -a --volumes
```

---

## 🧪 Pruebas de Integración

### **Probar comunicación entre contenedores:**
```powershell
# Desde backend hacia IA
docker exec empenio-backend-1 wget -qO- http://ia_module:5001/health

# Ver red compartida
docker network inspect empenio_empenio_network
```

### **Probar endpoints:**
```powershell
# Backend health
curl http://localhost:5000/api

# IA health
curl http://localhost:5001/health

# Predicción IA
curl -X POST http://localhost:5001/predict `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "Celular",
    "marca": "Samsung",
    "modelo": "Galaxy S21",
    "estado": "Usado",
    "anios_uso": 2
  }'
```

---

## 📦 Gestión de Imágenes

### **Ver imágenes Docker:**
```powershell
docker images
```

### **Eliminar imágenes no usadas:**
```powershell
docker image prune -a
```

### **Ver tamaño de imágenes:**
```powershell
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

---

## 💾 Gestión de Volúmenes

### **Ver volúmenes:**
```powershell
docker volume ls
```

### **Inspeccionar volumen:**
```powershell
docker volume inspect <volume_name>
```

### **Eliminar volúmenes no usados:**
```powershell
docker volume prune
```

---

## 🎯 Checklist de Verificación

Después de `docker-compose up -d`, verifica:

- [ ] **Backend corriendo:** `docker ps | findstr backend`
- [ ] **Frontend corriendo:** `docker ps | findstr frontend`
- [ ] **IA Module corriendo:** `docker ps | findstr ia_module`
- [ ] **Backend responde:** http://localhost:5000/api
- [ ] **IA responde:** http://localhost:5001/health
- [ ] **Frontend carga:** http://localhost:3000
- [ ] **Logs sin errores:** `docker-compose logs --tail 50`

---

## 📞 Ayuda Rápida

### **¿El frontend no carga?**
```powershell
docker-compose logs frontend | Select-String "error"
```

### **¿El backend no responde?**
```powershell
docker-compose logs backend | Select-String "error"
```

### **¿La IA no predice?**
```powershell
docker-compose logs ia_module | Select-String "error"
```

### **¿Todo va mal?**
```powershell
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## 🎓 Información Educativa

### **¿Qué hace cada contenedor?**

| Contenedor | Base | Propósito | Dependencias |
|-----------|------|-----------|--------------|
| `backend` | node:20-alpine | API REST con Express | SQLite, JWT, Multer |
| `frontend` | node:20-alpine | Interfaz React | React Router, Axios |
| `ia_module` | python:3.11-slim | API ML con Flask | scikit-learn, pandas |

### **Red Docker:**
- **Nombre:** `empenio_empenio_network`
- **Driver:** bridge
- **Comunicación:** Todos los contenedores pueden hablar entre sí

### **Volúmenes:**
- **Ninguno persistente** (todo en imágenes)
- Base de datos se crea en primera ejecución
- Modelo IA se entrena al construir la imagen

---

**Archivo creado:** 30 de Octubre 2025
**Propósito:** Guía de monitoreo y troubleshooting de Docker
