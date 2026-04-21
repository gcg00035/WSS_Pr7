/**
 * config.js - Configuración global del proyecto
 * Contiene variables y configuraciones del endpoint de Wikidata y URL del mapa
 */

// URL del endpoint SPARQL de Wikidata
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

// URL del GeoJSON con datos de países
const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

// Configuración inicial del mapa
const MAP_CONFIG = {
    center: [20, 0],
    zoom: 2,
    tileLayer: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap'
};

// Configuración de estilos del GeoJSON
const GEOJSON_STYLE = {
    color: "#555",
    weight: 1,
    fillOpacity: 0.2
};

// Configuración de las líneas de guerra
const POLYLINE_CONFIG = {
    color: '#ff4500',
    weight: 2,
    opacity: 0.7
};

// Configuración de los marcadores de batalla
const CIRCLE_MARKER_CONFIG = {
    radius: 4,
    color: 'yellow',
    fillOpacity: 0.9
};

// Límite de resultados en la consulta SPARQL
const QUERY_LIMIT = 100;
