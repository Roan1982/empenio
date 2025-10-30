@echo off
chcp 65001 >nul
cls
echo ============================================
echo  Sistema de Empenos Inteligente
echo  Instalacion con Entornos Virtuales
echo ============================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado en tu sistema
    echo.
    echo Por favor, descarga e instala Node.js desde:
    echo https://nodejs.org/
    echo.
    echo Asegurate de marcar "Add to PATH" durante la instalacion
    echo.
    pause
    exit /b 1
)

REM Verificar si npm está instalado
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado o no esta en PATH
    echo.
    echo npm viene incluido con Node.js
    echo Por favor, reinstala Node.js desde https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verificar si Python está instalado
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado en tu sistema
    echo.
    echo Por favor, descarga e instala Python 3.8+ desde:
    echo https://www.python.org/
    echo.
    echo Asegurate de marcar "Add Python to PATH" durante la instalacion
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js detectado: 
node --version
echo [✓] npm detectado: 
npm --version
echo [✓] Python detectado: 
python --version
echo.

echo [1/5] Creando entorno virtual de Python...
if not exist "venv" (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] No se pudo crear el entorno virtual de Python
        echo Verifica que Python este instalado correctamente
        pause
        exit /b 1
    )
    echo [✓] Entorno virtual de Python creado en: venv\
) else (
    echo [✓] Entorno virtual de Python ya existe
)

echo.
echo [2/5] Instalando dependencias del BACKEND (local)...
cd server
if not exist "node_modules" (
    echo Instalando paquetes en: server\node_modules\
    call npm install
    echo Instalando paquetes en: server\node_modules\
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo la instalacion de dependencias del backend
        cd ..
        pause
        exit /b 1
    )
    echo [✓] Backend instalado correctamente
) else (
    echo [✓] Dependencias del backend ya instaladas
)
cd ..

echo.
echo [3/5] Instalando dependencias del FRONTEND (local)...
cd client
if not exist "node_modules" (
    echo Instalando paquetes en: client\node_modules\
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Fallo la instalacion de dependencias del frontend
        cd ..
        pause
        exit /b 1
    )
    echo [✓] Frontend instalado correctamente
) else (
    echo [✓] Dependencias del frontend ya instaladas
)
cd ..

echo.
echo [4/5] Instalando dependencias del MODULO IA (entorno virtual)...
echo Activando entorno virtual Python...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [ERROR] No se pudo activar el entorno virtual
    pause
    exit /b 1
)

cd ia_module
echo Instalando scikit-learn, pandas, flask... (esto puede tomar 2-3 minutos)
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias Python
    cd ..
    call deactivate
    pause
    exit /b 1
)
echo [✓] Modulo IA instalado en entorno virtual
cd ..

echo.
echo [5/5] Entrenando modelo de Inteligencia Artificial...
cd ia_module
python train_model.py
if %errorlevel% neq 0 (
    echo [ERROR] Error al entrenar el modelo de IA
    cd ..
    call deactivate
    pause
    exit /b 1
)
echo [✓] Modelo de IA entrenado exitosamente
cd ..
call deactivate

echo.
echo ============================================
echo  ✓ INSTALACION COMPLETADA EXITOSAMENTE!
echo ============================================
echo.
echo ENTORNOS VIRTUALES CREADOS (TODO LOCAL):
echo   [Python]  venv\                    (~150 MB)
echo   [Backend] server\node_modules\     (~200 MB)
echo   [Frontend] client\node_modules\    (~300 MB)
echo   [Base de datos] server\empenios.db (creada al iniciar)
echo.
echo TOTAL: ~650 MB en esta carpeta
echo NADA instalado globalmente en tu PC
echo.
echo ============================================
echo  Siguiente paso: Ejecuta start.bat
echo ============================================
echo.
pause
