@echo off
chcp 65001 >nul
cls
echo ============================================
echo  Sistema de Empenos Inteligente
echo  ASISTENTE DE INSTALACION INTELIGENTE
echo ============================================
echo.
echo Detectando herramientas disponibles en tu sistema...
echo.

REM Variables de detección
set DOCKER_OK=0
set NODE_OK=0
set PYTHON_OK=0
set NPM_OK=0

REM Detectar Docker
where docker >nul 2>&1
if %errorlevel% equ 0 (
    set DOCKER_OK=1
    echo [✓] Docker detectado: 
    docker --version
) else (
    echo [✗] Docker NO detectado
)

REM Detectar Node.js
where node >nul 2>&1
if %errorlevel% equ 0 (
    set NODE_OK=1
    echo [✓] Node.js detectado: 
    node --version
) else (
    echo [✗] Node.js NO detectado
)

REM Detectar npm
where npm >nul 2>&1
if %errorlevel% equ 0 (
    set NPM_OK=1
    echo [✓] npm detectado: 
    npm --version
) else (
    echo [✗] npm NO detectado
)

REM Detectar Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_OK=1
    echo [✓] Python detectado: 
    python --version
) else (
    echo [✗] Python NO detectado
)

echo.
echo ============================================
echo  DIAGNOSTICO COMPLETADO
echo ============================================
echo.

REM Caso 1: Todo instalado (Node + Python)
if "%NODE_OK%"=="1" if "%NPM_OK%"=="1" if "%PYTHON_OK%"=="1" (
    echo [EXCELENTE] Tienes Node.js y Python instalados
    echo.
    echo Puedes ejecutar:
    echo   • install.bat     ^(instalar dependencias^)
    echo   • start.bat       ^(iniciar aplicacion^)
    echo.
    set /p ejecutar="¿Quieres ejecutar install.bat ahora? (S/N): "
    if /i "!ejecutar!"=="S" (
        echo.
        echo Ejecutando install.bat...
        call install.bat
    ) else (
        echo.
        echo Cuando estes listo, ejecuta: install.bat
    )
    goto :END
)

REM Caso 2: Docker disponible
if "%DOCKER_OK%"=="1" (
    echo [ALTERNATIVA DOCKER] Tienes Docker instalado
    echo.
    echo Aunque no tengas Node.js/Python, puedes usar Docker:
    echo   • docker-start.bat   ^(iniciar con contenedores^)
    echo.
    set /p ejecutar="¿Quieres ejecutar docker-start.bat ahora? (S/N): "
    if /i "!ejecutar!"=="S" (
        echo.
        echo Ejecutando docker-start.bat...
        call docker-start.bat
    ) else (
        echo.
        echo Cuando estes listo, ejecuta: docker-start.bat
    )
    goto :END
)

REM Caso 3: Nada instalado
echo [ATENCION] No tienes las herramientas necesarias
echo.
echo ============================================
echo  OPCIONES DE INSTALACION
echo ============================================
echo.
echo [1] OPCION RAPIDA: Node.js + Python (RECOMENDADO)
echo     • Descarga e instala Node.js: https://nodejs.org/
echo     • Descarga e instala Python: https://www.python.org/
echo     • Tiempo: 5 minutos
echo     • Desinstalable facilmente
echo     • Luego ejecuta: install.bat
echo.
echo [2] OPCION DOCKER: Contenedores aislados
echo     • Descarga e instala Docker Desktop
echo     • https://www.docker.com/products/docker-desktop/
echo     • Tiempo: 10 minutos + reinicio
echo     • Node/Python SOLO en contenedores
echo     • Luego ejecuta: docker-start.bat
echo.
echo [3] OPCION PORTABLE: Sin instalaciones (Avanzado)
echo     • Descarga versiones portables manualmente
echo     • Lee: INSTALACION_SIN_DEPENDENCIAS_GLOBALES.md
echo     • Tiempo: 15-20 minutos
echo     • Control total, sin registro Windows
echo.
echo ============================================
echo.

set /p opcion="Selecciona una opcion (1/2/3) o Enter para salir: "

if "%opcion%"=="1" (
    echo.
    echo Abriendo paginas de descarga...
    echo.
    start https://nodejs.org/
    timeout /t 2 /nobreak >nul
    start https://www.python.org/
    echo.
    echo ============================================
    echo  INSTRUCCIONES - Node.js
    echo ============================================
    echo 1. Descarga la version LTS (Long Term Support)
    echo 2. Ejecuta el instalador
    echo 3. IMPORTANTE: Marca "Add to PATH"
    echo 4. Click "Next" hasta finalizar
    echo.
    echo ============================================
    echo  INSTRUCCIONES - Python
    echo ============================================
    echo 1. Descarga la version 3.11 o superior
    echo 2. Ejecuta el instalador
    echo 3. IMPORTANTE: Marca "Add Python to PATH"
    echo 4. Click "Install Now"
    echo.
    echo ============================================
    echo.
    echo Despues de instalar ambos:
    echo 1. REINICIA esta terminal (PowerShell)
    echo 2. Ejecuta: iniciar.bat nuevamente
    echo 3. Luego ejecuta: install.bat
    echo.
)

if "%opcion%"=="2" (
    echo.
    echo Abriendo pagina de Docker Desktop...
    start https://www.docker.com/products/docker-desktop/
    echo.
    echo ============================================
    echo  INSTRUCCIONES - Docker Desktop
    echo ============================================
    echo 1. Descarga Docker Desktop para Windows
    echo 2. Ejecuta el instalador
    echo 3. Marca "Use WSL 2" (recomendado)
    echo 4. REINICIA tu PC despues de instalar
    echo 5. Abre Docker Desktop y espera que inicie
    echo 6. Ejecuta: docker-start.bat
    echo.
)

if "%opcion%"=="3" (
    echo.
    echo Abriendo guia detallada...
    start INSTALACION_SIN_DEPENDENCIAS_GLOBALES.md
    echo.
    echo Lee la seccion "Opcion 2: Node.js y Python Portables"
    echo Incluye links de descarga y pasos detallados
    echo.
)

:END
echo.
pause
