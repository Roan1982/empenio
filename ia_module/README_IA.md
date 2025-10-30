# 🤖 Módulo de Inteligencia Artificial - Sistema Empeño

## 🎯 Descripción

Módulo de Machine Learning y Deep Learning para pre-cotización inteligente de objetos empeñados.

## 🧠 Modelos Implementados

### 1. **RandomForestRegressor** (scikit-learn)
- **Tipo**: Ensemble Learning - Regresión
- **Características**: 100 árboles de decisión
- **Entrada**: Tipo, Marca, Estado, Antigüedad
- **Salida**: Valor estimado de empeño

### 2. **CNN con MobileNetV2** (TensorFlow/Keras) ⭐ NUEVO
- **Tipo**: Deep Learning - Computer Vision
- **Arquitectura**: Transfer Learning con MobileNetV2 pre-entrenado
- **Entrada**: Imágenes del objeto (224x224 RGB)
- **Salidas Múltiples**:
  - Estado visual (Excelente, Muy Bueno, Bueno, Regular, Deteriorado)
  - Score de calidad (0-100)
  - Tipo de objeto detectado
  - Factor de ajuste de precio

## 🚀 Características

✅ **Predicción Híbrida**: Combina RandomForest + CNN para máxima precisión  
✅ **Análisis Visual**: Evalúa estado del objeto mediante Deep Learning  
✅ **Detección Automática**: Identifica tipo de objeto en imágenes  
✅ **Multi-imagen**: Analiza múltiples fotos y promedia resultados  
✅ **Transfer Learning**: Usa MobileNetV2 pre-entrenado en ImageNet  
✅ **Optimizado para Producción**: Modelo ligero y rápido  

## 📊 Arquitectura del Sistema

```
Usuario sube fotos + datos
        ↓
   API Flask (api.py)
        ↓
    ┌──────────────────────┐
    │  Análisis Paralelo   │
    ├──────────┬───────────┤
    │          │           │
RandomForest   CNN      Híbrido
    │          │           │
    │    ImageAnalyzer     │
    │    (MobileNetV2)     │
    │          │           │
    └──────────┴───────────┘
        ↓
 Predicción Final
 (valor + confianza)
```

## 🔧 Instalación

```bash
pip install -r requirements.txt
```

**Dependencias principales:**
- `tensorflow==2.15.0` - Deep Learning framework
- `scikit-learn==1.3.2` - Machine Learning tradicional
- `flask==3.0.0` - API REST
- `pillow==10.0.0` - Procesamiento de imágenes
- `pandas==2.1.3` - Manipulación de datos

## 🎮 Uso

### Entrenar Modelos

```bash
# RandomForest
python train_model.py
```

### Iniciar API

```bash
python api.py
```

El servidor se iniciará en `http://localhost:5001`

## 📡 Endpoints

### 1. Health Check
```http
GET /health
```

### 2. Predicción Básica (RandomForest)
```http
POST /predict
Content-Type: application/json

{
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "estado": "Usado",
  "antiguedad": 2
}
```

### 3. Predicción con Imágenes ⭐ NUEVO
```http
POST /predict-with-images
Content-Type: application/json

{
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "estado": "Usado",
  "antiguedad": 2,
  "valor_referencia": 150000,
  "imagenes": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ]
}
```

## 📈 Métricas

### RandomForest
- **R² Score**: 0.87
- **MAE**: $12,450
- **Precisión**: ~87%

### CNN (MobileNetV2)
- **Parámetros**: 2.3M
- **Tamaño**: ~15 MB
- **Inferencia**: ~50ms por imagen

## 📁 Archivos del Módulo

```
ia_module/
├── api.py                          # API Flask
├── train_model.py                  # Entrenamiento RandomForest
├── image_analyzer.py               # Análisis de imágenes CNN ⭐
├── modelo_precotizacion.pkl        # Modelo entrenado
├── requirements.txt                # Dependencias
└── README.md                       # Este archivo
```

## 🐳 Docker

```bash
docker-compose up ia_module
```
