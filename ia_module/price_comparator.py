"""
Módulo de Web Scraping para comparación de precios en tiempo real
Busca precios de productos en múltiples plataformas de e-commerce
"""

import requests
from bs4 import BeautifulSoup
import re
import time
from typing import List, Dict, Optional
from urllib.parse import quote_plus
import json

class PriceComparator:
    """
    Comparador de precios que realiza web scraping en múltiples plataformas
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Plataformas soportadas
        self.platforms = {
            'mercadolibre': self._scrape_mercadolibre,
            'exito': self._scrape_exito,
            'alkomprar': self._scrape_alkomprar,
            'linio': self._scrape_linio
        }
    
    def buscar_precios(self, marca: str, modelo: str, tipo_objeto: str = None, max_resultados: int = 10) -> Dict:
        """
        Busca precios del producto en múltiples plataformas
        
        Args:
            marca: Marca del producto (ej: "Samsung", "Apple")
            modelo: Modelo específico (ej: "Galaxy S21", "iPhone 13")
            tipo_objeto: Tipo de producto (ej: "Celular", "Notebook")
            max_resultados: Máximo de resultados por plataforma
            
        Returns:
            Dict con precios encontrados y estadísticas
        """
        # Construir query de búsqueda
        if tipo_objeto:
            query = f"{tipo_objeto} {marca} {modelo}"
        else:
            query = f"{marca} {modelo}"
        
        print(f"🔍 Buscando precios para: {query}")
        
        resultados_por_plataforma = {}
        todos_los_precios = []
        
        # Buscar en cada plataforma
        for platform_name, scraper_func in self.platforms.items():
            try:
                print(f"  📊 Buscando en {platform_name}...")
                precios = scraper_func(query, max_resultados)
                
                if precios:
                    resultados_por_plataforma[platform_name] = precios
                    todos_los_precios.extend([p['precio'] for p in precios])
                    print(f"    ✅ Encontrados {len(precios)} resultados")
                else:
                    print(f"    ⚠️ Sin resultados")
                    
                # Esperar entre requests para no sobrecargar servidores
                time.sleep(1)
                
            except Exception as e:
                print(f"    ❌ Error en {platform_name}: {e}")
                continue
        
        # Calcular estadísticas
        if todos_los_precios:
            estadisticas = self._calcular_estadisticas(todos_los_precios)
        else:
            estadisticas = None
        
        return {
            'query': query,
            'total_resultados': len(todos_los_precios),
            'plataformas': resultados_por_plataforma,
            'estadisticas': estadisticas,
            'timestamp': time.time()
        }
    
    def _scrape_mercadolibre(self, query: str, max_resultados: int) -> List[Dict]:
        """Busca precios en MercadoLibre Colombia"""
        try:
            url = f"https://listado.mercadolibre.com.co/{quote_plus(query)}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            resultados = []
            
            # Buscar items de productos
            items = soup.find_all('div', class_='ui-search-result__wrapper')[:max_resultados]
            
            for item in items:
                try:
                    # Extraer precio
                    precio_elem = item.find('span', class_='andes-money-amount__fraction')
                    if not precio_elem:
                        continue
                    
                    precio_texto = precio_elem.text.strip().replace('.', '').replace(',', '')
                    precio = int(precio_texto)
                    
                    # Extraer título
                    titulo_elem = item.find('h2', class_='ui-search-item__title')
                    titulo = titulo_elem.text.strip() if titulo_elem else "Sin título"
                    
                    # Extraer URL
                    link_elem = item.find('a', class_='ui-search-link')
                    url = link_elem['href'] if link_elem else ""
                    
                    resultados.append({
                        'titulo': titulo,
                        'precio': precio,
                        'url': url,
                        'plataforma': 'MercadoLibre',
                        'moneda': 'COP'
                    })
                    
                except Exception as e:
                    continue
            
            return resultados
            
        except Exception as e:
            print(f"Error scraping MercadoLibre: {e}")
            return []
    
    def _scrape_exito(self, query: str, max_resultados: int) -> List[Dict]:
        """Busca precios en Éxito.com"""
        try:
            url = f"https://www.exito.com/s?q={quote_plus(query)}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            resultados = []
            
            # Buscar productos
            productos = soup.find_all('article', class_='vtex-product-summary')[:max_resultados]
            
            for producto in productos:
                try:
                    # Precio
                    precio_elem = producto.find('span', class_='exito-vtex-components')
                    if not precio_elem:
                        continue
                    
                    precio_texto = re.sub(r'[^\d]', '', precio_elem.text)
                    precio = int(precio_texto)
                    
                    # Título
                    titulo_elem = producto.find('span', class_='vtex-product-summary')
                    titulo = titulo_elem.text.strip() if titulo_elem else "Sin título"
                    
                    resultados.append({
                        'titulo': titulo,
                        'precio': precio,
                        'url': url,
                        'plataforma': 'Éxito',
                        'moneda': 'COP'
                    })
                    
                except Exception:
                    continue
            
            return resultados
            
        except Exception as e:
            print(f"Error scraping Éxito: {e}")
            return []
    
    def _scrape_alkomprar(self, query: str, max_resultados: int) -> List[Dict]:
        """Busca precios en Alkomprar.com"""
        try:
            # Alkomprar usa API REST
            url = f"https://www.alkomprar.com/buscar?q={quote_plus(query)}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            resultados = []
            
            productos = soup.find_all('div', class_='product-item')[:max_resultados]
            
            for producto in productos:
                try:
                    precio_elem = producto.find('span', class_='price')
                    if not precio_elem:
                        continue
                    
                    precio_texto = re.sub(r'[^\d]', '', precio_elem.text)
                    precio = int(precio_texto)
                    
                    titulo_elem = producto.find('h3', class_='product-name')
                    titulo = titulo_elem.text.strip() if titulo_elem else "Sin título"
                    
                    resultados.append({
                        'titulo': titulo,
                        'precio': precio,
                        'url': url,
                        'plataforma': 'Alkomprar',
                        'moneda': 'COP'
                    })
                    
                except Exception:
                    continue
            
            return resultados
            
        except Exception as e:
            print(f"Error scraping Alkomprar: {e}")
            return []
    
    def _scrape_linio(self, query: str, max_resultados: int) -> List[Dict]:
        """Busca precios en Linio Colombia"""
        try:
            url = f"https://www.linio.com.co/search?q={quote_plus(query)}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            resultados = []
            
            productos = soup.find_all('div', class_='catalogue-product')[:max_resultados]
            
            for producto in productos:
                try:
                    precio_elem = producto.find('span', class_='price-main')
                    if not precio_elem:
                        continue
                    
                    precio_texto = re.sub(r'[^\d]', '', precio_elem.text)
                    precio = int(precio_texto)
                    
                    titulo_elem = producto.find('div', class_='product-name')
                    titulo = titulo_elem.text.strip() if titulo_elem else "Sin título"
                    
                    resultados.append({
                        'titulo': titulo,
                        'precio': precio,
                        'url': url,
                        'plataforma': 'Linio',
                        'moneda': 'COP'
                    })
                    
                except Exception:
                    continue
            
            return resultados
            
        except Exception as e:
            print(f"Error scraping Linio: {e}")
            return []
    
    def _calcular_estadisticas(self, precios: List[int]) -> Dict:
        """Calcula estadísticas de los precios encontrados"""
        import numpy as np
        
        precios_array = np.array(precios)
        
        # Filtrar outliers (método IQR)
        q1 = np.percentile(precios_array, 25)
        q3 = np.percentile(precios_array, 75)
        iqr = q3 - q1
        limite_inferior = q1 - 1.5 * iqr
        limite_superior = q3 + 1.5 * iqr
        
        precios_filtrados = precios_array[
            (precios_array >= limite_inferior) & 
            (precios_array <= limite_superior)
        ]
        
        if len(precios_filtrados) == 0:
            precios_filtrados = precios_array
        
        return {
            'precio_promedio': float(np.mean(precios_filtrados)),
            'precio_mediana': float(np.median(precios_filtrados)),
            'precio_minimo': float(np.min(precios_filtrados)),
            'precio_maximo': float(np.max(precios_filtrados)),
            'desviacion_std': float(np.std(precios_filtrados)),
            'total_precios': len(precios),
            'precios_validos': len(precios_filtrados),
            'outliers_removidos': len(precios) - len(precios_filtrados)
        }
    
    def calcular_valor_empeno_recomendado(self, precio_mercado: float, estado: str, antiguedad: int) -> Dict:
        """
        Calcula valor de empeño recomendado basado en precio de mercado
        
        Args:
            precio_mercado: Precio promedio encontrado en el mercado
            estado: Estado del objeto (Nuevo, Usado, Deteriorado)
            antiguedad: Años de uso
            
        Returns:
            Dict con valor recomendado y detalles
        """
        # Factores de depreciación
        factores_estado = {
            'nuevo': 0.70,      # 70% del precio de mercado
            'excelente': 0.65,
            'muy bueno': 0.60,
            'bueno': 0.50,
            'usado': 0.45,
            'regular': 0.35,
            'deteriorado': 0.25
        }
        
        # Depreciación por antigüedad (5% por año)
        factor_antiguedad = max(0.5, 1.0 - (antiguedad * 0.05))
        
        # Factor base según estado
        factor_estado = factores_estado.get(estado.lower(), 0.50)
        
        # Calcular valor de empeño
        factor_total = factor_estado * factor_antiguedad
        valor_empeno = precio_mercado * factor_total
        
        # Calcular rango (±10%)
        margen = valor_empeno * 0.10
        
        return {
            'precio_mercado': round(precio_mercado, 2),
            'factor_estado': factor_estado,
            'factor_antiguedad': round(factor_antiguedad, 2),
            'factor_total': round(factor_total, 2),
            'valor_empeno_recomendado': round(valor_empeno, 2),
            'valor_minimo': round(valor_empeno - margen, 2),
            'valor_maximo': round(valor_empeno + margen, 2),
            'formula': f"{precio_mercado} × {factor_estado} × {factor_antiguedad} = {valor_empeno}"
        }


class GoogleImageSearch:
    """
    Búsqueda de productos similares usando Google Images
    (Requiere API Key de Google Custom Search)
    """
    
    def __init__(self, api_key: str = None, cx: str = None):
        self.api_key = api_key or "TU_GOOGLE_API_KEY"
        self.cx = cx or "TU_CUSTOM_SEARCH_ENGINE_ID"
        self.base_url = "https://www.googleapis.com/customsearch/v1"
    
    def buscar_por_imagen_similar(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Busca productos similares en Google Shopping
        """
        try:
            params = {
                'key': self.api_key,
                'cx': self.cx,
                'q': query,
                'searchType': 'image',
                'num': limit,
                'fileType': 'jpg,png'
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            resultados = []
            
            for item in data.get('items', []):
                resultados.append({
                    'titulo': item.get('title', ''),
                    'url': item.get('link', ''),
                    'thumbnail': item.get('image', {}).get('thumbnailLink', ''),
                    'contexto': item.get('snippet', '')
                })
            
            return resultados
            
        except Exception as e:
            print(f"Error en Google Image Search: {e}")
            return []


# Función auxiliar para integración con API
def comparar_precios_web(marca: str, modelo: str, tipo_objeto: str = None) -> Dict:
    """
    Función wrapper para usar en api.py
    """
    try:
        comparator = PriceComparator()
        resultados = comparator.buscar_precios(marca, modelo, tipo_objeto)
        return resultados
    except Exception as e:
        print(f"❌ Error comparando precios: {e}")
        return None


if __name__ == "__main__":
    # Prueba del módulo
    print("🧪 Probando comparador de precios...")
    
    comparator = PriceComparator()
    
    # Ejemplo: buscar Samsung Galaxy S21
    resultados = comparator.buscar_precios("Samsung", "Galaxy S21", "Celular")
    
    if resultados['estadisticas']:
        print(f"\n📊 Resultados:")
        print(f"   Total encontrados: {resultados['total_resultados']}")
        print(f"   Precio promedio: ${resultados['estadisticas']['precio_promedio']:,.0f}")
        print(f"   Rango: ${resultados['estadisticas']['precio_minimo']:,.0f} - ${resultados['estadisticas']['precio_maximo']:,.0f}")
        
        # Calcular valor de empeño
        valor_empeno = comparator.calcular_valor_empeno_recomendado(
            precio_mercado=resultados['estadisticas']['precio_promedio'],
            estado='Usado',
            antiguedad=1
        )
        
        print(f"\n💰 Valor de empeño recomendado: ${valor_empeno['valor_empeno_recomendado']:,.0f}")
        print(f"   Rango: ${valor_empeno['valor_minimo']:,.0f} - ${valor_empeno['valor_maximo']:,.0f}")
    else:
        print("⚠️ No se encontraron resultados")
