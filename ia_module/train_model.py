import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import os

# Dataset de empeños históricos
data = {
    'tipo_objeto': ['Celular', 'Notebook', 'Tablet', 'Reloj', 'Televisor', 'Consola', 'Celular', 
                    'Notebook', 'Tablet', 'Reloj', 'Televisor', 'Consola', 'Celular', 'Notebook',
                    'Tablet', 'Joya', 'Joya', 'Celular', 'Notebook', 'Televisor', 'Consola', 
                    'Reloj', 'Tablet', 'Celular', 'Notebook', 'Joya', 'Televisor', 'Consola',
                    'Celular', 'Tablet', 'Reloj', 'Notebook', 'Joya', 'Televisor', 'Celular',
                    'Notebook', 'Consola', 'Tablet', 'Reloj', 'Joya'],
    'marca': ['Samsung', 'Lenovo', 'Samsung', 'Casio', 'LG', 'PlayStation', 'Apple', 
              'HP', 'Apple', 'Rolex', 'Samsung', 'Xbox', 'Xiaomi', 'Dell',
              'Huawei', 'Genérica', 'Tiffany', 'Motorola', 'Asus', 'Sony', 'Nintendo',
              'Citizen', 'Lenovo', 'OnePlus', 'Acer', 'Cartier', 'Philips', 'Sony',
              'Realme', 'Samsung', 'Omega', 'Apple', 'Pandora', 'TCL', 'Oppo',
              'MSI', 'PlayStation', 'Xiaomi', 'Seiko', 'Gucci'],
    'estado': ['Usado', 'Nuevo', 'Usado', 'Usado', 'Usado', 'Nuevo', 'Nuevo',
               'Usado', 'Nuevo', 'Usado', 'Usado', 'Nuevo', 'Usado', 'Usado',
               'Nuevo', 'Usado', 'Nuevo', 'Usado', 'Nuevo', 'Usado', 'Nuevo',
               'Usado', 'Usado', 'Nuevo', 'Usado', 'Nuevo', 'Usado', 'Nuevo',
               'Usado', 'Nuevo', 'Usado', 'Nuevo', 'Usado', 'Usado', 'Nuevo',
               'Usado', 'Nuevo', 'Usado', 'Usado', 'Nuevo'],
    'antiguedad': [2, 1, 3, 4, 3, 0, 1, 2, 0, 5, 2, 0, 3, 4, 1, 10, 2, 3, 1, 4, 0,
                   6, 2, 1, 3, 5, 4, 0, 2, 1, 8, 0, 15, 3, 1, 2, 0, 2, 7, 3],
    'valor_empeño': [90000, 210000, 60000, 40000, 95000, 180000, 450000,
                     180000, 280000, 850000, 120000, 200000, 75000, 150000,
                     90000, 30000, 320000, 65000, 280000, 140000, 240000,
                     55000, 170000, 380000, 165000, 1200000, 110000, 190000,
                     85000, 95000, 920000, 520000, 180000, 85000, 420000,
                     195000, 185000, 88000, 78000, 580000]
}

df = pd.DataFrame(data)

# Codificar variables categóricas
le_tipo = LabelEncoder()
le_marca = LabelEncoder()
le_estado = LabelEncoder()

df['tipo_encoded'] = le_tipo.fit_transform(df['tipo_objeto'])
df['marca_encoded'] = le_marca.fit_transform(df['marca'])
df['estado_encoded'] = le_estado.fit_transform(df['estado'])

# Features y target
X = df[['tipo_encoded', 'marca_encoded', 'estado_encoded', 'antiguedad']]
y = df['valor_empeño']

# Dividir datos
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entrenar modelo
modelo = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
modelo.fit(X_train, y_train)

# Evaluar
score = modelo.score(X_test, y_test)
print(f'✅ Modelo entrenado con R² score: {score:.4f}')

# Guardar modelo y encoders
model_dir = os.path.dirname(os.path.abspath(__file__))
joblib.dump(modelo, os.path.join(model_dir, 'modelo_precotizacion.pkl'))
joblib.dump(le_tipo, os.path.join(model_dir, 'encoder_tipo.pkl'))
joblib.dump(le_marca, os.path.join(model_dir, 'encoder_marca.pkl'))
joblib.dump(le_estado, os.path.join(model_dir, 'encoder_estado.pkl'))

print('✅ Modelo y encoders guardados correctamente')

# Prueba de predicción
print('\n📊 Prueba de predicción:')
ejemplo = {
    'tipo_objeto': 'Celular',
    'marca': 'Samsung',
    'estado': 'Usado',
    'antiguedad': 2
}

tipo_enc = le_tipo.transform([ejemplo['tipo_objeto']])[0]
marca_enc = le_marca.transform([ejemplo['marca']])[0]
estado_enc = le_estado.transform([ejemplo['estado']])[0]

prediccion = modelo.predict([[tipo_enc, marca_enc, estado_enc, ejemplo['antiguedad']]])
print(f'Objeto: {ejemplo["tipo_objeto"]} {ejemplo["marca"]} ({ejemplo["estado"]}, {ejemplo["antiguedad"]} años)')
print(f'Valor estimado: ${prediccion[0]:,.0f}')
