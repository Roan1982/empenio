@echo off
chcp 65001 >nul
cls
title Sistema de Empenos Inteligente

echo ============================================
echo  Sistema de Empenos Inteligente
echo  Iniciando con entornos virtuales
echo ============================================
echo.

REM Verificar instalaciones
if not exist "server\node_modules" (
    echo [ERROR] Backend no instalado
    echo Ejecuta: install.bat
    pause
    exit /b 1
)

if not exist "client\node_modules" (
    echo [ERROR] Frontend no instalado
    echo Ejecuta: install.bat
    pause
    exit /b 1
)

if not exist "venv" (
    echo [ERROR] Entorno virtual Python no encontrado
    echo Ejecuta: install.bat
    pause
    exit /b 1
)

if not exist "ia_module\modelo_precotizacion.pkl" (
    echo [ERROR] Modelo de IA no entrenado
    echo Ejecuta: install.bat
    pause
    exit /b 1
)

echo [✓] Verificaciones completadas
echo.

echo [1/3] Iniciando Backend API (Puerto 5000)...
start "Backend - Puerto 5000" cmd /k "cd /d %~dp0server && node index.js"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Modulo IA con Python Virtual (Puerto 5001)...
start "IA Module - Puerto 5001" cmd /k "cd /d %~dp0 && call venv\Scripts\activate.bat && cd ia_module && python api.py"
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando Frontend React (Puerto 3000)...
start "Frontend - Puerto 3000" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ============================================
echo  ✓ SERVICIOS INICIADOS CORRECTAMENTE
echo ============================================
echo.
echo Se abrieron 3 ventanas de terminal:
echo   • Backend API  - http://localhost:5000
echo   • IA Module    - http://localhost:5001  
echo   • Frontend Web - http://localhost:3000
echo.
echo ENTORNOS ACTIVOS:
echo   [Backend/Frontend] Node.js local
echo   [IA Module] Python venv aislado
echo.
echo ============================================
echo  CREDENCIALES DE ADMINISTRADOR
echo ============================================
echo   Email:    admin@empenio.com
echo   Password: admin123
echo.
echo El navegador se abrira automaticamente en 5 segundos...
echo.
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo ============================================
echo  SISTEMA EN EJECUCION
echo ============================================
echo.
echo Para DETENER los servicios:
echo   • Presiona Ctrl+C en cada ventana de terminal
echo   • O cierra las 3 ventanas
echo.
echo Esta ventana puede cerrarse sin afectar los servicios
echo.
pause
