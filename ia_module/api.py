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

if __name__ == '__main__':
    print('🤖 Servidor de IA iniciando en puerto 5001...')
    app.run(host='0.0.0.0', port=5001, debug=True)
