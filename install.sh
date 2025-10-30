#!/bin/bash

echo "============================================"
echo " Sistema de Empeños Inteligente"
echo " Instalación y configuración inicial"
echo "============================================"
echo ""

echo "[1/4] Instalando dependencias del backend..."
npm install
if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias del backend"
    exit 1
fi

echo ""
echo "[2/4] Instalando dependencias del frontend..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias del frontend"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Configurando módulo de IA..."
cd ia_module
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Error: Python no está instalado o no está en PATH"
    echo "Por favor, instala Python 3.8+ desde python.org"
    exit 1
fi

source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error al instalar dependencias de Python"
    exit 1
fi

echo ""
echo "[4/4] Entrenando modelo de IA..."
python train_model.py
if [ $? -ne 0 ]; then
    echo "Error al entrenar el modelo"
    exit 1
fi

cd ..

echo ""
echo "============================================"
echo " Instalación completada exitosamente!"
echo "============================================"
echo ""
echo "Para iniciar el sistema, ejecuta: ./start.sh"
echo ""
