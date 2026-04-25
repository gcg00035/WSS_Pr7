# Memoria Práctica 7
## Mapa histórico de Batallas



***
### Autor: Gonzalo Carcelén Gómez

URL del proyecto: https://wss-pr7.vercel.app/ 
***


Este proyecto muestra un mapa interactivo para explorar batallas históricas asociadas a un país.
Al hacer clic sobre un país del mapa, la aplicación consulta Wikidata, obtiene las batallas relacionadas
y las dibuja sobre Leaflet junto con un listado lateral de resultados.

## ¿Cómo funciona?

1. Se carga un mapa mundial con la base oscura `dark_all` de CartoDB.
2. El usuario hace clic sobre un país del GeoJSON.
3. Se toma el código ISO del país seleccionado.
4. Se lanza una consulta SPARQL a Wikidata buscando batallas (`Q178561`) vinculadas al país mediante `P297`.
5. Los resultados se filtran y procesan para obtener nombre y coordenadas.
6. Las batallas se pintan en el mapa con líneas y marcadores, y también se muestran en un listado lateral.

> Las batallas mostradas en el mapa están limitadas a un máximo de 100 por país para evitar sobrecargar la vista
> y reducir latencias en la carga de datos.

## Estructura del proyecto

```text
Pr7/
├── index.html
├── README.md
├── css/
│   └── style.css
├── data/
└── js/
	├── api.js
	├── config.js
	├── main.js
	├── map.js
	└── utils.js
```

## Descripción de archivos

### `index.html`
Contiene la estructura mínima de la página. Carga las hojas de estilo y las librerías externas, y al final del `<body>`
importa los scripts locales en este orden: `config.js`, `api.js`, `map.js` y `main.js`.

### `css/style.css`
Incluye todos los estilos de la interfaz: mapa, panel de información, listado de batallas, splash screen,
loader y estados visuales como selección, éxito y error.

### `js/config.js`
Define la configuración global del proyecto:

- `WIKIDATA_ENDPOINT`: endpoint SPARQL de Wikidata.
- `GEOJSON_URL`: GeoJSON de países usado para pintar el mapa.
- `MAP_CONFIG`: centro inicial, zoom y capa base.
- `GEOJSON_STYLE`, `POLYLINE_CONFIG`, `CIRCLE_MARKER_CONFIG`: estilos visuales.
- `QUERY_LIMIT`: límite de resultados por consulta.

### `js/api.js`
Gestiona la comunicación con Wikidata. Contiene:

- `queryGuerrasPorISO(codigoISO)`: construye la consulta SPARQL para buscar batallas de un país.
- `makeSPARQLQuery(endpointUrl, sparqlQuery, doneCallback)`: ejecuta la petición AJAX.
- `procesarResultadosBatallas(data)`: transforma la respuesta SPARQL en un array usable por el mapa.

### `js/map.js`
Contiene la lógica específica de Leaflet:

- inicialización del mapa.
- carga del GeoJSON de países.
- captura de clics sobre cada país.
- dibujo de polilíneas hacia las batallas.
- creación de marcadores circulares.
- ajuste automático del encuadre del mapa.

### `js/main.js`
Es el orquestador de la aplicación. Coordina la interacción entre la interfaz, la API y el mapa:

- actualiza el nombre del país seleccionado.
- muestra u oculta el loader.
- solicita las batallas a Wikidata.
- actualiza el listado lateral.
- gestiona la batalla seleccionada.

### `js/utils.js`
Archivo reservado para utilidades compartidas. En la versión actual está vacío, pero se mantiene preparado para
funciones auxiliares futuras, como normalización de datos o validaciones comunes.

### `data/`
Carpeta destinada a datos locales del proyecto. En esta versión está vacía.

## Tecnologías utilizadas

- **jQuery 3.3.1** para la manipulación del DOM y peticiones AJAX.
- **Leaflet 1.7.1** para el mapa interactivo.
- **Wikidata SPARQL Endpoint** para recuperar las batallas.
- **GeoJSON** de Natural Earth para los límites de países.
- **CartoDB dark_all** como mapa base.

## Consulta SPARQL utilizada

```sparql
SELECT ?battle ?battleLabel ?lat ?lon
WHERE {
  ?country wdt:P297 "CODIGO_ISO".

  ?battle wdt:P31 wd:Q178561;
		  wdt:P710 ?participant;
		  wdt:P625 ?coords.

  ?participant wdt:P17 ?country.

  BIND(geof:latitude(?coords) AS ?lat)
  BIND(geof:longitude(?coords) AS ?lon)

  SERVICE wikibase:label {
	bd:serviceParam wikibase:language "es,en".
  }
}
LIMIT 100
```

## Flujo de uso

1. Abrir `index.html` en el navegador.
2. Esperar a que se cargue el mapa y el GeoJSON.
3. Hacer clic en un país.
4. Ver el panel lateral con el nombre del país y el estado de carga.
5. Consultar las batallas devueltas por Wikidata.
6. Explorar los marcadores, las líneas y el listado de batallas.

## Notas de implementación

- Las coordenadas se procesan y filtran antes de dibujarse en el mapa.
- El panel lateral cambia entre estados de carga, error y éxito.
- El proyecto está organizado de forma modular para facilitar su mantenimiento.
