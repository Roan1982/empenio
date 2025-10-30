#!/bin/bash

echo "============================================"
echo " Sistema de Empeños Inteligente"
echo " Iniciando servicios..."
echo "============================================"
echo ""

echo "[*] Iniciando Backend (Puerto 5000)..."
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
npm run dev &

sleep 2

echo "[*] Iniciando Frontend (Puerto 3000)..."
gnome-terminal -- bash -c "cd client && npm start; exec bash" 2>/dev/null || \
xterm -e "cd client && npm start" 2>/dev/null || \
(cd client && npm start) &

sleep 2

echo "[*] Iniciando Módulo IA (Puerto 5001)..."
gnome-terminal -- bash -c "cd ia_module && source venv/bin/activate && python api.py; exec bash" 2>/dev/null || \
xterm -e "cd ia_module && source venv/bin/activate && python api.py" 2>/dev/null || \
(cd ia_module && source venv/bin/activate && python api.py) &

echo ""
echo "============================================"
echo " Servicios iniciados correctamente!"
echo "============================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "IA API:   http://localhost:5001"
echo ""
echo "Credenciales de administrador:"
echo "  Email:    admin@empenio.com"
echo "  Password: admin123"
echo ""
echo "Abriendo navegador..."

# Detectar el navegador y abrir
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v gnome-open > /dev/null; then
    gnome-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "Para detener los servicios, presiona Ctrl+C"
echo ""

# Esperar
wait
