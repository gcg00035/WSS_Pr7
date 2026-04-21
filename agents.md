# Instrucciones del Proyecto: Mapa Histórico de Batallas

Eres un experto en desarrollo Web y Datos Enlazados (Linked Data). Tu objetivo es refactorizar el código actual (mezclado en un solo HTML) hacia una arquitectura limpia, modular y fácil de mantener.

## 1. Estructura de Archivos Obligatoria
Debes dividir el código en los siguientes archivos y carpetas:

- `index.html`: Estructura DOM mínima. Importa los estilos en el `<head>` y los scripts al final del `<body>`.
- `css/style.css`: Contiene todos los estilos (mapa, info-box, clases de estado).
- `js/config.js`: Variables globales (Endpoint de Wikidata, URL del GeoJSON, configuración inicial del mapa).
- `js/api.js`: Lógica de comunicación. Contiene la función `makeSPARQLQuery` y las plantillas de las consultas (como `queryGuerrasPorISO`).
- `js/map.js`: Lógica pura de Leaflet. Funciones para inicializar el mapa, cargar el GeoJSON, dibujar polilíneas y círculos.
- `js/main.js`: Orquestador. Maneja el `$(document).ready` y los eventos de clic, coordinando las llamadas entre `api.js` y `map.js`.

## 2. Reglas de Refactorización (Clean Code)
- **Separación de Intereses**: El archivo `api.js` no debe saber que existe un mapa; solo debe devolver datos JSON. El archivo `map.js` no debe saber nada de SPARQL; solo recibe coordenadas para pintar.
- **Nombres Descriptivos**: Cambia variables genéricas como `g` o `e` por nombres claros (`batalla`, `eventoClic`).
- **Comentarios**: Documenta brevemente cada función explicando qué recibe y qué devuelve.
- **Tratamiento de Datos**: Asegúrate de que los `parseFloat` de las coordenadas se realicen en una función auxiliar dentro de `js/utils.js` (si lo consideras necesario) o dentro de la lógica de procesamiento antes de pintar.

## 3. Especificaciones Técnicas
- **Librerías**: Mantener jQuery 3.3.1 y Leaflet 1.7.1.
- **Mapa Base**: Usar el estilo oscuro de CartoDB (`dark_all`).
- **Wikidata**: La consulta debe mantener la lógica de buscar batallas (`Q178561`) asociadas al código ISO (`P297`) del país seleccionado.
