from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
from flask import Flask

app = Flask(__name__)

# Cargar modelo y encoders
model_dir = os.path.dirname(os.path.abspath(__file__))
modelo = joblib.load(os.path.join(model_dir, 'modelo_precotizacion.pkl'))
le_tipo = joblib.load(os.path.join(model_dir, 'encoder_tipo.pkl'))
le_marca = joblib.load(os.path.join(model_dir, 'encoder_marca.pkl'))
le_estado = joblib.load(os.path.join(model_dir, 'encoder_estado.pkl'))

print('✅ Modelo de IA cargado correctamente')

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

if __name__ == '__main__':
    print('🤖 Servidor de IA iniciando en puerto 5001...')
    app.run(host='0.0.0.0', port=5001, debug=True)
