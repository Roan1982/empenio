# 🌐 Módulo de Comparación de Precios Web

## 📋 Descripción

Sistema de **Web Scraping** que busca precios reales de productos en múltiples plataformas de e-commerce colombiano para mejorar la precisión de las cotizaciones.

## 🎯 Plataformas Soportadas

| Plataforma | URL | Estado |
|------------|-----|--------|
| **MercadoLibre** | mercadolibre.com.co | ✅ Activo |
| **Éxito** | exito.com | ✅ Activo |
| **Alkomprar** | alkomprar.com | ✅ Activo |
| **Linio** | linio.com.co | ✅ Activo |

## 🚀 Características

✅ **Multi-plataforma**: Busca en 4 plataformas simultáneamente  
✅ **Filtrado de Outliers**: Usa IQR para eliminar precios anómalos  
✅ **Estadísticas**: Promedio, mediana, mínimo, máximo, desviación  
✅ **Cálculo Inteligente**: Factor de depreciación por estado y antigüedad  
✅ **Rango de Valores**: Valor mínimo, promedio y máximo  
✅ **Rate Limiting**: Espera entre requests para no sobrecargar servidores  

## 📡 API Endpoints

### 1. Comparar Precios Web

```http
POST /compare-prices
Content-Type: application/json

{
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "tipo_objeto": "Celular",
  "estado": "Usado",
  "antiguedad": 2
}
```

**Respuesta:**
```json
{
  "success": true,
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "tipo_objeto": "Celular",
  "precios_web": {
    "total_resultados": 15,
    "precio_promedio": 1850000.00,
    "precio_minimo": 1650000.00,
    "precio_maximo": 2100000.00,
    "desviacion": 145230.50,
    "plataformas": ["MercadoLibre", "Éxito", "Linio"]
  },
  "valor_empeno_recomendado": {
    "precio_mercado": 1850000.00,
    "factor_estado": 0.45,
    "factor_antiguedad": 0.90,
    "factor_total": 0.405,
    "valor_empeno_recomendado": 749250.00,
    "valor_minimo": 674325.00,
    "valor_maximo": 824175.00
  },
  "detalles_por_plataforma": {
    "MercadoLibre": [
      {
        "titulo": "Samsung Galaxy S21 128gb Usado",
        "precio": 1799000,
        "url": "https://...",
        "plataforma": "MercadoLibre"
      }
    ]
  }
}
```

### 2. Predicción Completa (RF + CNN + Web)

```http
POST /predict-complete
Content-Type: application/json

{
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "tipo_objeto": "Celular",
  "estado": "Usado",
  "antiguedad": 2,
  "imagenes": ["data:image/jpeg;base64,..."]
}
```

**Respuesta:**
```json
{
  "tipo_objeto": "Celular",
  "marca": "Samsung",
  "modelo": "Galaxy S21",
  "estado": "Usado",
  "antiguedad": 2,
  "metodos_usados": [
    "RandomForest",
    "CNN (Computer Vision)",
    "Web Scraping (Precios de Mercado)"
  ],
  "prediccion_randomforest": 820000.00,
  "analisis_visual": {
    "estado_detectado": "Bueno",
    "calidad_score": 78.5,
    "tipo_detectado": "Celular",
    "factor_ajuste": 0.75
  },
  "comparacion_web": {
    "precio_mercado_promedio": 1850000.00,
    "precio_minimo": 1650000.00,
    "precio_maximo": 2100000.00,
    "total_resultados": 15,
    "plataformas": ["MercadoLibre", "Éxito", "Linio"],
    "valor_empeno_sugerido": 749250.00
  },
  "prediccion_final": {
    "valor_estimado": 785600.00,
    "valor_minimo": 707040.00,
    "valor_maximo": 864160.00,
    "confiabilidad": 0.99,
    "metodo": "Predicción Completa (RF + CNN + Web)",
    "detalles": "Combinación ponderada de 2 fuentes"
  }
}
```

## 🔧 Funcionamiento Interno

### Algoritmo de Comparación

```python
1. Construir query de búsqueda: "{tipo} {marca} {modelo}"
2. Para cada plataforma:
   a. Hacer request HTTP con User-Agent
   b. Parsear HTML con BeautifulSoup
   c. Extraer precios y títulos
   d. Normalizar formato de precios
3. Filtrar outliers con método IQR
4. Calcular estadísticas (promedio, mediana, etc.)
5. Aplicar factor de depreciación:
   - Por estado (Nuevo: 70%, Usado: 45%, etc.)
   - Por antigüedad (5% por año)
6. Retornar valor de empeño recomendado
```

### Factores de Depreciación

| Estado | Factor | Descripción |
|--------|--------|-------------|
| Nuevo | 0.70 | 70% del precio de mercado |
| Excelente | 0.65 | 65% del precio |
| Muy Bueno | 0.60 | 60% del precio |
| Bueno | 0.50 | 50% del precio |
| Usado | 0.45 | 45% del precio |
| Regular | 0.35 | 35% del precio |
| Deteriorado | 0.25 | 25% del precio |

**Antigüedad**: -5% por cada año de uso (mínimo 50%)

## 🎓 Ejemplo de Uso en Python

```python
from price_comparator import PriceComparator

comparator = PriceComparator()

# Buscar precios
resultados = comparator.buscar_precios(
    marca="Apple",
    modelo="iPhone 13 Pro",
    tipo_objeto="Celular",
    max_resultados=10
)

# Ver estadísticas
print(f"Precio promedio: ${resultados['estadisticas']['precio_promedio']:,.0f}")
print(f"Total encontrados: {resultados['total_resultados']}")

# Calcular valor de empeño
valor = comparator.calcular_valor_empeno_recomendado(
    precio_mercado=resultados['estadisticas']['precio_promedio'],
    estado='Usado',
    antiguedad=1
)

print(f"Valor empeño: ${valor['valor_empeno_recomendado']:,.0f}")
print(f"Rango: ${valor['valor_minimo']:,.0f} - ${valor['valor_maximo']:,.0f}")
```

## ⚡ Optimizaciones

### Rate Limiting
- Espera de 1 segundo entre requests
- User-Agent rotativo (futuro)
- Caché de resultados por 1 hora (futuro)

### Manejo de Errores
- Timeout de 10 segundos por request
- Continúa si una plataforma falla
- Logs detallados de errores

### Performance
- Requests paralelos (futuro con asyncio)
- Caché con Redis (futuro)
- Proxy rotation (futuro)

## 🔒 Consideraciones Éticas

### ✅ Buenas Prácticas:
- User-Agent identificable
- Rate limiting (1 req/segundo)
- Solo datos públicos
- No login/autenticación
- Respeta robots.txt

### ⚠️ Limitaciones:
- Algunos sitios pueden bloquear
- Estructura HTML puede cambiar
- Requiere mantenimiento
- No hacer scraping masivo

## 🌟 Mejoras Futuras

- [ ] Soporte para Google Shopping API
- [ ] Búsqueda por imagen inversa
- [ ] Caché con Redis (TTL 1 hora)
- [ ] Requests asíncronos (asyncio)
- [ ] Proxy rotation automático
- [ ] Machine Learning para normalizar títulos
- [ ] Detección de ofertas/descuentos
- [ ] Histórico de precios (tendencias)

## 📚 Dependencias

```bash
pip install beautifulsoup4==4.12.2
pip install requests==2.31.0
pip install lxml==4.9.3
```

## 🎯 Integración con Módulo de IA

El comparador de precios se integra con:

1. **RandomForest**: Valida predicciones
2. **CNN**: Combina análisis visual + precios reales
3. **Predicción Final**: Ponderación inteligente

**Fórmula de Combinación:**
```python
prediccion_final = (
    prediccion_rf * factor_visual * 0.4 +
    precio_mercado * factor_depreciacion * 0.6
)
```

## 📊 Resultados Esperados

- **Precisión**: +15% vs solo RandomForest
- **Confiabilidad**: 95-99% con precios web
- **Velocidad**: 2-5 segundos por búsqueda
- **Cobertura**: 60-80% de productos populares

---

*Módulo desarrollado para propósitos académicos y educativos - 2025*
