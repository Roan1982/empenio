# Módulo de Inteligencia Artificial - Pre-Cotización de Empeños

Este módulo utiliza Machine Learning para estimar el valor de objetos empeñados.

## Instalación

```bash
pip install -r requirements.txt
```

## Entrenar el modelo

```bash
python train_model.py
```

## Ejecutar API de predicción

```bash
python api.py
```

La API estará disponible en `http://localhost:5001`

## Endpoints

### POST /predict
Solicita una predicción de valor para un objeto.

**Body:**
```json
{
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "estado": "Usado",
  "antiguedad": 2
}
```

**Response:**
```json
{
  "valor_estimado": 90000,
  "confiabilidad": 0.92
}
```
