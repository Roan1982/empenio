from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from flask import Flask
from werkzeug.utils import secure_filename
import base64
from io import BytesIO
from PIL import Image

# Importar analizador de imágenes
try:
    from image_analyzer import ImageAnalyzer
    VISION_ENABLED = True
    print('✅ Módulo de visión por computadora habilitado')
except ImportError as e:
    VISION_ENABLED = False
    print(f'⚠️ Módulo de visión deshabilitado: {e}')
    print('   Instalar con: pip install tensorflow pillow')

# Importar comparador de precios web
try:
    from price_comparator import PriceComparator
    WEB_SCRAPING_ENABLED = True
    print('✅ Módulo de comparación de precios web habilitado')
except ImportError as e:
    WEB_SCRAPING_ENABLED = False
    print(f'⚠️ Módulo de web scraping deshabilitado: {e}')
    print('   Instalar con: pip install beautifulsoup4 requests')

app = Flask(__name__)

# Configuración
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Cargar modelo y encoders
model_dir = os.path.dirname(os.path.abspath(__file__))
modelo = joblib.load(os.path.join(model_dir, 'modelo_precotizacion.pkl'))
le_tipo = joblib.load(os.path.join(model_dir, 'encoder_tipo.pkl'))
le_marca = joblib.load(os.path.join(model_dir, 'encoder_marca.pkl'))
le_estado = joblib.load(os.path.join(model_dir, 'encoder_estado.pkl'))

# Inicializar analizador de imágenes
image_analyzer = None
if VISION_ENABLED:
    try:
        image_analyzer = ImageAnalyzer()
        print('✅ Analizador de imágenes inicializado')
    except Exception as e:
        print(f'⚠️ Error inicializando analizador: {e}')
        VISION_ENABLED = False

# Inicializar comparador de precios
price_comparator = None
if WEB_SCRAPING_ENABLED:
    try:
        price_comparator = PriceComparator()
        print('✅ Comparador de precios inicializado')
    except Exception as e:
        print(f'⚠️ Error inicializando comparador: {e}')
        WEB_SCRAPING_ENABLED = False

print('✅ Modelo de IA cargado correctamente')


def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'IA Pre-Cotización',
        'version': '1.0.0'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        tipo_objeto = data.get('tipo_objeto', 'Celular')
        marca = data.get('marca', 'Genérica')
        estado = data.get('estado', 'Usado')
        antiguedad = int(data.get('antiguedad', 1))
        
        # Normalizar texto
        tipo_objeto = tipo_objeto.capitalize()
        marca = marca.capitalize()
        estado = estado.capitalize()
        
        # Manejar valores desconocidos
        try:
            tipo_enc = le_tipo.transform([tipo_objeto])[0]
        except:
            # Si el tipo no está en el encoder, usar un valor predeterminado
            tipo_enc = le_tipo.transform(['Celular'])[0]
        
        try:
            marca_enc = le_marca.transform([marca])[0]
        except:
            marca_enc = le_marca.transform(['Genérica'])[0]
        
        try:
            estado_enc = le_estado.transform([estado])[0]
        except:
            estado_enc = le_estado.transform(['Usado'])[0]
        
        # Predecir
        features = np.array([[tipo_enc, marca_enc, estado_enc, antiguedad]])
        prediccion = modelo.predict(features)[0]
        
        # Calcular confiabilidad basada en la antigüedad y estado
        confiabilidad = 0.95
        if antiguedad > 5:
            confiabilidad -= 0.1
        if estado.lower() == 'deteriorado':
            confiabilidad -= 0.15
        
        confiabilidad = max(0.5, min(0.99, confiabilidad))
        
        return jsonify({
            'valor_estimado': round(prediccion, 2),
            'confiabilidad': round(confiabilidad, 2),
            'tipo_objeto': tipo_objeto,
            'marca': marca,
            'estado': estado,
            'antiguedad': antiguedad
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Error al procesar predicción'
        }), 500


@app.route('/predict-with-images', methods=['POST'])
def predict_with_images():
    """
    Predicción mejorada con análisis de imágenes mediante Deep Learning
    Acepta imágenes en base64 o archivos multipart
    """
    try:
        # Obtener datos básicos
        if request.is_json:
            data = request.json
            imagenes_base64 = data.get('imagenes', [])
            imagenes = []
            
            # Decodificar imágenes base64
            for img_b64 in imagenes_base64:
                try:
                    # Remover prefijo data:image si existe
                    if ',' in img_b64:
                        img_b64 = img_b64.split(',')[1]
                    
                    img_bytes = base64.b64decode(img_b64)
                    img = Image.open(BytesIO(img_bytes))
                    imagenes.append(img)
                except Exception as e:
                    print(f"⚠️ Error decodificando imagen: {e}")
                    continue
        else:
            # Formulario multipart
            data = request.form.to_dict()
            imagenes = []
            
            # Obtener archivos de imagen
            for key in request.files:
                file = request.files[key]
                if file and allowed_file(file.filename):
                    img = Image.open(file.stream)
                    imagenes.append(img)
        
        tipo_objeto = data.get('tipo_objeto', 'Celular')
        marca = data.get('marca', 'Genérica')
        estado = data.get('estado', 'Usado')
        antiguedad = int(data.get('antiguedad', 1))
        valor_referencia = float(data.get('valor_referencia', 100000))
        
        # Normalizar texto
        tipo_objeto = tipo_objeto.capitalize()
        marca = marca.capitalize()
        estado = estado.capitalize()
        
        # ========== ANÁLISIS DE IMÁGENES CON CNN ==========
        analisis_visual = None
        factor_ajuste_visual = 1.0
        
        if VISION_ENABLED and image_analyzer and imagenes:
            try:
                print(f"🔍 Analizando {len(imagenes)} imágenes con Deep Learning...")
                analisis_visual = image_analyzer.analizar_multiples_imagenes(imagenes)
                
                if analisis_visual:
                    # Ajustar predicción basada en análisis visual
                    factor_ajuste_visual = analisis_visual['factor_ajuste_precio']
                    
                    # Actualizar estado si la visión detectó algo diferente
                    estado_visual = analisis_visual['estado_visual']
                    print(f"✅ Estado visual detectado: {estado_visual} (factor: {factor_ajuste_visual})")
                    
                    # Si el usuario no especificó tipo, usar el detectado
                    if data.get('tipo_objeto') is None:
                        tipo_objeto = analisis_visual['tipo_detectado']
                        print(f"✅ Tipo detectado automáticamente: {tipo_objeto}")
                
            except Exception as e:
                print(f"⚠️ Error en análisis visual: {e}")
                analisis_visual = None
        
        # ========== PREDICCIÓN CON RANDOM FOREST ==========
        # Codificar características
        try:
            tipo_enc = le_tipo.transform([tipo_objeto])[0]
        except:
            tipo_enc = le_tipo.transform(['Celular'])[0]
        
        try:
            marca_enc = le_marca.transform([marca])[0]
        except:
            marca_enc = le_marca.transform(['Genérica'])[0]
        
        try:
            estado_enc = le_estado.transform([estado])[0]
        except:
            estado_enc = le_estado.transform(['Usado'])[0]
        
        # Predecir con Random Forest
        features = np.array([[tipo_enc, marca_enc, estado_enc, antiguedad]])
        prediccion_base = modelo.predict(features)[0]
        
        # ========== COMBINAR PREDICCIONES ==========
        # Aplicar factor de ajuste visual
        prediccion_final = prediccion_base * factor_ajuste_visual
        
        # Si hay valor de referencia, considerar también
        if valor_referencia > 0:
            # Ponderar entre predicción del modelo y valor de referencia
            prediccion_final = (prediccion_final * 0.6) + (valor_referencia * 0.4 * factor_ajuste_visual)
        
        # Calcular confiabilidad
        confiabilidad_base = 0.85
        
        # Aumentar confiabilidad si hay análisis visual
        if analisis_visual:
            calidad_visual = analisis_visual['calidad_score'] / 100
            confiabilidad_base += 0.15 * calidad_visual  # Bonus hasta +15%
        
        # Ajustar por antigüedad
        if antiguedad > 5:
            confiabilidad_base -= 0.08
        if antiguedad > 10:
            confiabilidad_base -= 0.12
        
        # Ajustar por estado
        if estado.lower() == 'deteriorado':
            confiabilidad_base -= 0.15
        elif estado.lower() in ['nuevo', 'excelente']:
            confiabilidad_base += 0.05
        
        confiabilidad_final = max(0.5, min(0.99, confiabilidad_base))
        
        # Calcular rango de valor (±10%)
        margen = prediccion_final * 0.10
        valor_minimo = prediccion_final - margen
        valor_maximo = prediccion_final + margen
        
        # Preparar respuesta
        respuesta = {
            'valor_estimado': round(prediccion_final, 2),
            'valor_minimo': round(valor_minimo, 2),
            'valor_maximo': round(valor_maximo, 2),
            'confiabilidad': round(confiabilidad_final, 2),
            'tipo_objeto': tipo_objeto,
            'marca': marca,
            'estado': estado,
            'antiguedad': antiguedad,
            'metodo': 'Híbrido (RandomForest + CNN)' if analisis_visual else 'RandomForest',
            'imagenes_analizadas': len(imagenes) if imagenes else 0
        }
        
        # Agregar detalles de análisis visual si está disponible
        if analisis_visual:
            respuesta['analisis_visual'] = {
                'estado_detectado': analisis_visual['estado_visual'],
                'calidad_score': round(analisis_visual['calidad_score'], 2),
                'tipo_detectado': analisis_visual['tipo_detectado'],
                'factor_ajuste': round(analisis_visual['factor_ajuste_precio'], 2),
                'confianza': 'Alta' if analisis_visual['calidad_score'] > 80 else 'Media' if analisis_visual['calidad_score'] > 60 else 'Baja'
            }
        
        return jsonify(respuesta)
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Error al procesar predicción con imágenes'
        }), 500


@app.route('/compare-prices', methods=['POST'])
def compare_prices():
    """
    Compara precios del producto en la web (MercadoLibre, Éxito, Linio, etc.)
    Usa web scraping para obtener precios reales del mercado
    """
    try:
        if not WEB_SCRAPING_ENABLED or not price_comparator:
            return jsonify({
                'error': 'Módulo de web scraping no disponible',
                'message': 'Instalar: pip install beautifulsoup4 requests'
            }), 503
        
        data = request.json
        marca = data.get('marca', '').capitalize()
        modelo = data.get('modelo', '')
        tipo_objeto = data.get('tipo_objeto', '').capitalize()
        
        if not marca or not modelo:
            return jsonify({
                'error': 'Faltan parámetros requeridos',
                'message': 'Se requiere marca y modelo'
            }), 400
        
        print(f"🔍 Comparando precios web para: {marca} {modelo}")
        
        # Buscar precios en la web
        resultados = price_comparator.buscar_precios(marca, modelo, tipo_objeto, max_resultados=10)
        
        if not resultados['estadisticas']:
            return jsonify({
                'success': False,
                'message': 'No se encontraron precios en la web',
                'resultados': resultados
            })
        
        # Calcular valor de empeño basado en precios web
        estado = data.get('estado', 'Usado').capitalize()
        antiguedad = int(data.get('antiguedad', 1))
        
        valor_empeno = price_comparator.calcular_valor_empeno_recomendado(
            precio_mercado=resultados['estadisticas']['precio_promedio'],
            estado=estado,
            antiguedad=antiguedad
        )
        
        return jsonify({
            'success': True,
            'marca': marca,
            'modelo': modelo,
            'tipo_objeto': tipo_objeto,
            'precios_web': {
                'total_resultados': resultados['total_resultados'],
                'precio_promedio': resultados['estadisticas']['precio_promedio'],
                'precio_minimo': resultados['estadisticas']['precio_minimo'],
                'precio_maximo': resultados['estadisticas']['precio_maximo'],
                'desviacion': resultados['estadisticas']['desviacion_std'],
                'plataformas': list(resultados['plataformas'].keys())
            },
            'valor_empeno_recomendado': valor_empeno,
            'detalles_por_plataforma': resultados['plataformas']
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Error al comparar precios en la web'
        }), 500


@app.route('/predict-complete', methods=['POST'])
def predict_complete():
    """
    Predicción completa que combina:
    1. RandomForest (datos estructurados)
    2. CNN (análisis visual de imágenes)
    3. Web Scraping (precios reales de mercado)
    
    Retorna la predicción más precisa posible
    """
    try:
        # Obtener datos
        if request.is_json:
            data = request.json
            imagenes_base64 = data.get('imagenes', [])
            imagenes = []
            
            for img_b64 in imagenes_base64:
                try:
                    if ',' in img_b64:
                        img_b64 = img_b64.split(',')[1]
                    img_bytes = base64.b64decode(img_b64)
                    img = Image.open(BytesIO(img_bytes))
                    imagenes.append(img)
                except Exception as e:
                    print(f"⚠️ Error decodificando imagen: {e}")
                    continue
        else:
            data = request.form.to_dict()
            imagenes = []
            for key in request.files:
                file = request.files[key]
                if file and allowed_file(file.filename):
                    img = Image.open(file.stream)
                    imagenes.append(img)
        
        tipo_objeto = data.get('tipo_objeto', 'Celular').capitalize()
        marca = data.get('marca', 'Genérica').capitalize()
        modelo = data.get('modelo', '')
        estado = data.get('estado', 'Usado').capitalize()
        antiguedad = int(data.get('antiguedad', 1))
        
        resultados = {
            'tipo_objeto': tipo_objeto,
            'marca': marca,
            'modelo': modelo,
            'estado': estado,
            'antiguedad': antiguedad,
            'metodos_usados': []
        }
        
        # ========== 1. PREDICCIÓN RANDOMFOREST ==========
        try:
            tipo_enc = le_tipo.transform([tipo_objeto])[0]
        except:
            tipo_enc = le_tipo.transform(['Celular'])[0]
        
        try:
            marca_enc = le_marca.transform([marca])[0]
        except:
            marca_enc = le_marca.transform(['Genérica'])[0]
        
        try:
            estado_enc = le_estado.transform([estado])[0]
        except:
            estado_enc = le_estado.transform(['Usado'])[0]
        
        features = np.array([[tipo_enc, marca_enc, estado_enc, antiguedad]])
        prediccion_rf = modelo.predict(features)[0]
        
        resultados['prediccion_randomforest'] = round(prediccion_rf, 2)
        resultados['metodos_usados'].append('RandomForest')
        
        # ========== 2. ANÁLISIS VISUAL CNN (si hay imágenes) ==========
        factor_visual = 1.0
        analisis_visual = None
        
        if VISION_ENABLED and image_analyzer and imagenes:
            try:
                print(f"🔍 Analizando {len(imagenes)} imágenes...")
                analisis_visual = image_analyzer.analizar_multiples_imagenes(imagenes)
                
                if analisis_visual:
                    factor_visual = analisis_visual['factor_ajuste_precio']
                    resultados['analisis_visual'] = {
                        'estado_detectado': analisis_visual['estado_visual'],
                        'calidad_score': round(analisis_visual['calidad_score'], 2),
                        'tipo_detectado': analisis_visual['tipo_detectado'],
                        'factor_ajuste': round(factor_visual, 2)
                    }
                    resultados['metodos_usados'].append('CNN (Computer Vision)')
            except Exception as e:
                print(f"⚠️ Error en análisis visual: {e}")
        
        # ========== 3. COMPARACIÓN DE PRECIOS WEB (si hay marca/modelo) ==========
        precio_mercado = None
        factor_mercado = 1.0
        
        if WEB_SCRAPING_ENABLED and price_comparator and modelo:
            try:
                print(f"🌐 Buscando precios en la web para {marca} {modelo}...")
                resultados_web = price_comparator.buscar_precios(marca, modelo, tipo_objeto, max_resultados=5)
                
                if resultados_web['estadisticas']:
                    precio_mercado = resultados_web['estadisticas']['precio_promedio']
                    
                    # Calcular valor de empeño basado en mercado
                    valor_empeno_web = price_comparator.calcular_valor_empeno_recomendado(
                        precio_mercado, estado, antiguedad
                    )
                    
                    resultados['comparacion_web'] = {
                        'precio_mercado_promedio': round(precio_mercado, 2),
                        'precio_minimo': round(resultados_web['estadisticas']['precio_minimo'], 2),
                        'precio_maximo': round(resultados_web['estadisticas']['precio_maximo'], 2),
                        'total_resultados': resultados_web['total_resultados'],
                        'plataformas': list(resultados_web['plataformas'].keys()),
                        'valor_empeno_sugerido': valor_empeno_web['valor_empeno_recomendado']
                    }
                    resultados['metodos_usados'].append('Web Scraping (Precios de Mercado)')
                    
            except Exception as e:
                print(f"⚠️ Error en web scraping: {e}")
        
        # ========== 4. COMBINACIÓN INTELIGENTE DE PREDICCIONES ==========
        predicciones = []
        pesos = []
        
        # RandomForest con factor visual
        pred_rf_ajustada = prediccion_rf * factor_visual
        predicciones.append(pred_rf_ajustada)
        pesos.append(0.4)  # 40% peso
        
        # Precio de mercado (si está disponible)
        if precio_mercado:
            # Aplicar mismo factor de depreciación que en web scraping
            factores_estado = {
                'nuevo': 0.70, 'excelente': 0.65, 'muy bueno': 0.60,
                'bueno': 0.50, 'usado': 0.45, 'regular': 0.35, 'deteriorado': 0.25
            }
            factor_estado = factores_estado.get(estado.lower(), 0.50)
            factor_antiguedad = max(0.5, 1.0 - (antiguedad * 0.05))
            
            pred_mercado = precio_mercado * factor_estado * factor_antiguedad * factor_visual
            predicciones.append(pred_mercado)
            pesos.append(0.60)  # 60% peso (mayor confianza en datos reales)
        
        # Normalizar pesos
        pesos_array = np.array(pesos)
        pesos_norm = pesos_array / pesos_array.sum()
        
        # Predicción final ponderada
        prediccion_final = sum(p * w for p, w in zip(predicciones, pesos_norm))
        
        # Calcular confiabilidad
        confiabilidad = 0.80
        if analisis_visual:
            confiabilidad += 0.10  # +10% si hay análisis visual
        if precio_mercado:
            confiabilidad += 0.10  # +10% si hay precios web
        
        confiabilidad = min(0.99, confiabilidad)
        
        # Calcular rango
        margen = prediccion_final * 0.10
        
        resultados['prediccion_final'] = {
            'valor_estimado': round(prediccion_final, 2),
            'valor_minimo': round(prediccion_final - margen, 2),
            'valor_maximo': round(prediccion_final + margen, 2),
            'confiabilidad': round(confiabilidad, 2),
            'metodo': 'Predicción Completa (RF + CNN + Web)',
            'detalles': f"Combinación ponderada de {len(predicciones)} fuentes"
        }
        
        return jsonify(resultados)
        
    except Exception as e:
        import traceback
        print(f"❌ Error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Error en predicción completa'
        }), 500


if __name__ == '__main__':
    print('🤖 Servidor de IA iniciando en puerto 5001...')
    app.run(host='0.0.0.0', port=5001, debug=True)
