@echo off
chcp 65001 >nul
echo Deteniendo servicios Docker...
docker-compose down
echo.
echo [✓] Servicios detenidos
echo.
pause
