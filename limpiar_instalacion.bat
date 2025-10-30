@echo off
chcp 65001 >nul
cls
echo ============================================
echo  Sistema de Empenos Inteligente
echo  LIMPIEZA DE INSTALACION
echo ============================================
echo.
echo ADVERTENCIA: Este script eliminara:
echo   • venv\ (entorno virtual Python)
echo   • server\node_modules\ (dependencias backend)
echo   • client\node_modules\ (dependencias frontend)
echo   • server\empenios.db (base de datos)
echo   • ia_module\*.pkl (modelos entrenados)
echo   • server\uploads\ (archivos subidos)
echo.
echo NADA se eliminara fuera de esta carpeta
echo.
set /p confirmar="¿Estas seguro? (S/N): "

if /i not "%confirmar%"=="S" (
    echo Operacion cancelada
    pause
    exit /b 0
)

echo.
echo Eliminando entorno virtual Python...
if exist "venv" (
    rmdir /s /q venv
    echo [✓] venv\ eliminado
) else (
    echo [-] venv\ no existe
)

echo.
echo Eliminando dependencias del backend...
if exist "server\node_modules" (
    rmdir /s /q server\node_modules
    echo [✓] server\node_modules\ eliminado
) else (
    echo [-] server\node_modules\ no existe
)

echo.
echo Eliminando dependencias del frontend...
if exist "client\node_modules" (
    rmdir /s /q client\node_modules
    echo [✓] client\node_modules\ eliminado
) else (
    echo [-] client\node_modules\ no existe
)

echo.
echo Eliminando base de datos...
if exist "server\empenios.db" (
    del /f /q server\empenios.db
    echo [✓] server\empenios.db eliminado
) else (
    echo [-] server\empenios.db no existe
)

echo.
echo Eliminando modelos entrenados...
if exist "ia_module\*.pkl" (
    del /f /q ia_module\*.pkl
    echo [✓] Modelos .pkl eliminados
) else (
    echo [-] No hay modelos .pkl
)

echo.
echo Eliminando archivos subidos...
if exist "server\uploads" (
    rmdir /s /q server\uploads
    echo [✓] server\uploads\ eliminado
) else (
    echo [-] server\uploads\ no existe
)

echo.
echo ============================================
echo  LIMPIEZA COMPLETADA
echo ============================================
echo.
echo Espacio liberado: ~650 MB
echo.
echo Para reinstalar, ejecuta: install.bat
echo.
pause
