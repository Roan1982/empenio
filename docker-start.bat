@echo off
chcp 65001 >nul
cls
echo ============================================
echo  Sistema de Empenos Inteligente
echo  Iniciando TODO con Docker
echo ============================================
echo.

REM Verificar si Docker está instalado
where docker >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo ============================================
    echo  [ERROR] Docker NO esta instalado
    echo ============================================
    echo.
    echo Para ejecutar con Docker, necesitas Docker Desktop.
    echo.
    echo Descarga desde: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [✓] Docker detectado: 
docker --version
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop no esta corriendo
    echo.
    echo Por favor:
    echo 1. Abre Docker Desktop
    echo 2. Espera que el icono se ponga verde
    echo 3. Ejecuta este script nuevamente
    echo.
    pause
    exit /b 1
)

echo [✓] Docker Desktop corriendo
echo.

echo [1/4] Deteniendo contenedores anteriores...
docker-compose down >nul 2>&1
echo [✓] Limpieza completada
echo.

echo [2/4] Construyendo imagenes Docker (5-10 min primera vez)...
echo      - Backend (Node.js 20)
echo      - Frontend (React 18)  
echo      - IA Module (Python 3.11)
echo.
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la construccion de imagenes
    pause
    exit /b 1
)
echo [✓] Imagenes construidas exitosamente
echo.

echo [3/4] Iniciando servicios en contenedores...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al iniciar servicios
    pause
    exit /b 1
)
echo [✓] Contenedores iniciados
echo.

echo [4/4] Esperando que los servicios esten listos...
timeout /t 15 /nobreak >nul
echo.

echo ============================================
echo  ✓ SISTEMA COMPLETAMENTE EN DOCKER
echo ============================================
echo.
echo SERVICIOS ACTIVOS:
docker-compose ps
echo.
echo ============================================
echo  ACCESO A LA APLICACION
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api
echo IA API:   http://localhost:5001/health
echo.
echo ============================================
echo  CREDENCIALES DE ADMINISTRADOR
echo ============================================
echo   Email:    admin@empenio.com
echo   Password: admin123
echo.
echo ============================================
echo  VERIFICACION: Node.js NO esta en Windows
echo ============================================
echo.
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [✓] Correcto: Node.js NO instalado en Windows
) else (
    echo [!] Node.js detectado en Windows (pero Docker usa su propia version)
)
echo.
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [✓] Correcto: Python NO instalado en Windows
) else (
    echo [!] Python detectado en Windows (pero Docker usa su propia version)
)
echo.

echo ============================================
echo  ABRIENDO NAVEGADOR...
echo ============================================
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo COMANDOS UTILES:
echo   Ver logs:        docker-compose logs -f
echo   Reiniciar:       docker-compose restart
echo   Detener:         docker-compose down
echo   Ver estado:      docker-compose ps
echo.
echo Esta ventana puede cerrarse. Los servicios siguen corriendo.
echo.
pause


echo [✓] Docker detectado
docker --version
echo.

echo [1/2] Construyendo contenedores (primera vez: 5-10 min)...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la construccion de contenedores
    pause
    exit /b 1
)

echo.
echo [2/2] Iniciando servicios en contenedores...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al iniciar servicios
    pause
    exit /b 1
)

echo.
echo ============================================
echo  ✓ SISTEMA EN EJECUCION (DOCKER)
echo ============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo IA API:   http://localhost:5001
echo.
echo IMPORTANTE:
echo   • NADA instalado en tu sistema
echo   • Todo funciona en contenedores aislados
echo   • Node.js y Python SOLO dentro de Docker
echo.
echo Credenciales:
echo   Email:    admin@empenio.com
echo   Password: admin123
echo.
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Para DETENER los servicios:
echo   docker-compose down
echo.
echo Para ver logs:
echo   docker-compose logs -f
echo.
pause
