"""
Módulo de Análisis de Imágenes con Deep Learning
Usa MobileNetV2 pre-entrenado + capas personalizadas para evaluar objetos
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras import layers, Model
from PIL import Image
import io
import os

class ImageAnalyzer:
    """
    Analizador de imágenes con CNN para evaluar estado y características de objetos
    """
    
    def __init__(self, model_path='modelo_vision.h5'):
        self.model_path = model_path
        self.model = None
        self.img_size = (224, 224)
        
        # Categorías de estado visual
        self.estado_categorias = ['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Deteriorado']
        
        # Tipos de objetos que puede reconocer
        self.tipo_objetos = ['Celular', 'Notebook', 'Tablet', 'Reloj', 'Auriculares', 
                             'Consola', 'Camara', 'Electrodomestico', 'Otro']
        
        # Cargar o crear modelo
        self._inicializar_modelo()
    
    def _inicializar_modelo(self):
        """Carga modelo existente o crea uno nuevo"""
        if os.path.exists(self.model_path):
            try:
                self.model = keras.models.load_model(self.model_path)
                print(f"✅ Modelo de visión cargado desde {self.model_path}")
            except Exception as e:
                print(f"⚠️ Error cargando modelo: {e}. Creando nuevo...")
                self.model = self._crear_modelo()
        else:
            print(f"⚠️ Modelo no encontrado. Creando nuevo modelo...")
            self.model = self._crear_modelo()
    
    def _crear_modelo(self):
        """
        Crea modelo CNN usando MobileNetV2 pre-entrenado (Transfer Learning)
        MobileNetV2: modelo ligero, rápido, optimizado para producción
        """
        # Cargar MobileNetV2 pre-entrenado en ImageNet
        base_model = MobileNetV2(
            input_shape=(224, 224, 3),
            include_top=False,  # Sin capa de clasificación
            weights='imagenet'   # Pesos pre-entrenados
        )
        
        # Congelar capas base (Transfer Learning)
        base_model.trainable = False
        
        # Construir modelo personalizado
        inputs = keras.Input(shape=(224, 224, 3))
        
        # Preprocesamiento
        x = keras.applications.mobilenet_v2.preprocess_input(inputs)
        
        # Capas base (congeladas)
        x = base_model(x, training=False)
        
        # Pooling global
        x = layers.GlobalAveragePooling2D()(x)
        
        # Capas densas personalizadas
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Salidas múltiples
        # 1. Estado del objeto (clasificación)
        estado_output = layers.Dense(5, activation='softmax', name='estado')(x)
        
        # 2. Score de calidad (regresión 0-100)
        calidad_output = layers.Dense(1, activation='sigmoid', name='calidad')(x)
        
        # 3. Tipo de objeto (clasificación)
        tipo_output = layers.Dense(9, activation='softmax', name='tipo')(x)
        
        # Crear modelo con múltiples salidas
        model = Model(
            inputs=inputs,
            outputs={
                'estado': estado_output,
                'calidad': calidad_output,
                'tipo': tipo_output
            }
        )
        
        # Compilar modelo
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss={
                'estado': 'categorical_crossentropy',
                'calidad': 'mse',
                'tipo': 'categorical_crossentropy'
            },
            loss_weights={
                'estado': 1.0,
                'calidad': 0.5,
                'tipo': 0.8
            },
            metrics={
                'estado': 'accuracy',
                'calidad': 'mae',
                'tipo': 'accuracy'
            }
        )
        
        print("✅ Modelo CNN creado con MobileNetV2")
        return model
    
    def preprocesar_imagen(self, img_data):
        """
        Preprocesa imagen para el modelo
        
        Args:
            img_data: bytes o PIL Image
            
        Returns:
            numpy array (1, 224, 224, 3)
        """
        # Convertir bytes a PIL Image si es necesario
        if isinstance(img_data, bytes):
            img = Image.open(io.BytesIO(img_data))
        else:
            img = img_data
        
        # Convertir a RGB si es necesario
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Redimensionar
        img = img.resize(self.img_size)
        
        # Convertir a array numpy
        img_array = image.img_to_array(img)
        
        # Expandir dimensiones (batch)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def analizar_imagen(self, img_data):
        """
        Analiza una imagen y retorna predicciones
        
        Args:
            img_data: bytes de la imagen o PIL Image
            
        Returns:
            dict con análisis completo
        """
        # Preprocesar imagen
        img_array = self.preprocesar_imagen(img_data)
        
        # Predecir
        predicciones = self.model.predict(img_array, verbose=0)
        
        # Procesar resultados
        estado_probs = predicciones['estado'][0]
        estado_idx = np.argmax(estado_probs)
        estado_confianza = float(estado_probs[estado_idx])
        
        calidad_score = float(predicciones['calidad'][0][0]) * 100
        
        tipo_probs = predicciones['tipo'][0]
        tipo_idx = np.argmax(tipo_probs)
        tipo_confianza = float(tipo_probs[tipo_idx])
        
        # Calcular factor de ajuste basado en estado visual
        # Excelente: 1.0, Muy Bueno: 0.9, Bueno: 0.75, Regular: 0.55, Deteriorado: 0.35
        factores_estado = [1.0, 0.9, 0.75, 0.55, 0.35]
        factor_ajuste = factores_estado[estado_idx]
        
        resultado = {
            'estado_visual': {
                'categoria': self.estado_categorias[estado_idx],
                'confianza': estado_confianza,
                'probabilidades': {
                    cat: float(prob) 
                    for cat, prob in zip(self.estado_categorias, estado_probs)
                }
            },
            'calidad_score': calidad_score,
            'tipo_detectado': {
                'categoria': self.tipo_objetos[tipo_idx],
                'confianza': tipo_confianza,
                'probabilidades': {
                    cat: float(prob) 
                    for cat, prob in zip(self.tipo_objetos, tipo_probs)
                }
            },
            'factor_ajuste_precio': factor_ajuste,
            'recomendacion': self._generar_recomendacion(estado_idx, calidad_score)
        }
        
        return resultado
    
    def analizar_multiples_imagenes(self, imagenes_data):
        """
        Analiza múltiples imágenes y promedia resultados
        
        Args:
            imagenes_data: lista de bytes o PIL Images
            
        Returns:
            dict con análisis promediado
        """
        if not imagenes_data:
            return None
        
        resultados = []
        for img_data in imagenes_data:
            try:
                resultado = self.analizar_imagen(img_data)
                resultados.append(resultado)
            except Exception as e:
                print(f"⚠️ Error analizando imagen: {e}")
                continue
        
        if not resultados:
            return None
        
        # Promediar calidad y factor de ajuste
        calidad_promedio = np.mean([r['calidad_score'] for r in resultados])
        factor_promedio = np.mean([r['factor_ajuste_precio'] for r in resultados])
        
        # Estado más frecuente
        estados = [r['estado_visual']['categoria'] for r in resultados]
        estado_frecuente = max(set(estados), key=estados.count)
        
        # Tipo más frecuente
        tipos = [r['tipo_detectado']['categoria'] for r in resultados]
        tipo_frecuente = max(set(tipos), key=tipos.count)
        
        return {
            'numero_imagenes': len(resultados),
            'estado_visual': estado_frecuente,
            'calidad_score': float(calidad_promedio),
            'tipo_detectado': tipo_frecuente,
            'factor_ajuste_precio': float(factor_promedio),
            'analisis_individual': resultados
        }
    
    def _generar_recomendacion(self, estado_idx, calidad_score):
        """Genera recomendación basada en análisis"""
        if estado_idx <= 1 and calidad_score >= 85:
            return "Objeto en excelente estado. Valor de empeño alto."
        elif estado_idx <= 2 and calidad_score >= 70:
            return "Objeto en buen estado. Valor de empeño moderado-alto."
        elif estado_idx <= 3 and calidad_score >= 50:
            return "Objeto usado pero funcional. Valor de empeño moderado."
        elif estado_idx <= 4 and calidad_score >= 30:
            return "Objeto con desgaste visible. Valor de empeño bajo."
        else:
            return "Objeto muy deteriorado. Valor de empeño muy bajo."
    
    def entrenar_con_datos(self, imagenes, etiquetas, epochs=10):
        """
        Entrena o fine-tunea el modelo con datos propios
        
        Args:
            imagenes: array de imágenes preprocesadas
            etiquetas: dict con 'estado', 'calidad', 'tipo'
            epochs: número de épocas
        """
        print(f"🏋️ Entrenando modelo con {len(imagenes)} imágenes...")
        
        # Descongelar últimas capas para fine-tuning
        self.model.layers[2].trainable = True  # base_model
        for layer in self.model.layers[2].layers[:-20]:
            layer.trainable = False
        
        # Re-compilar con learning rate menor
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss={
                'estado': 'categorical_crossentropy',
                'calidad': 'mse',
                'tipo': 'categorical_crossentropy'
            },
            loss_weights={'estado': 1.0, 'calidad': 0.5, 'tipo': 0.8},
            metrics={
                'estado': 'accuracy',
                'calidad': 'mae',
                'tipo': 'accuracy'
            }
        )
        
        # Entrenar
        history = self.model.fit(
            imagenes,
            etiquetas,
            epochs=epochs,
            batch_size=32,
            validation_split=0.2,
            callbacks=[
                keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=3,
                    restore_best_weights=True
                )
            ]
        )
        
        # Guardar modelo
        self.model.save(self.model_path)
        print(f"✅ Modelo guardado en {self.model_path}")
        
        return history
    
    def extraer_caracteristicas(self, img_data):
        """
        Extrae vector de características de la imagen (embedding)
        Útil para similaridad de imágenes
        
        Returns:
            numpy array de características (1280 dimensiones)
        """
        img_array = self.preprocesar_imagen(img_data)
        
        # Obtener salida de la capa de pooling
        feature_extractor = Model(
            inputs=self.model.input,
            outputs=self.model.get_layer('global_average_pooling2d').output
        )
        
        features = feature_extractor.predict(img_array, verbose=0)
        return features[0]


# Función auxiliar para integración con API
def analizar_imagen_para_cotizacion(img_data):
    """
    Función wrapper para usar en api.py
    """
    try:
        analyzer = ImageAnalyzer()
        resultado = analyzer.analizar_imagen(img_data)
        return resultado
    except Exception as e:
        print(f"❌ Error en análisis de imagen: {e}")
        return None


if __name__ == "__main__":
    # Prueba del modelo
    print("🧪 Inicializando analizador de imágenes...")
    analyzer = ImageAnalyzer()
    print("✅ Analizador listo para usar")
    print(f"📊 Modelo: {analyzer.model.summary()}")
