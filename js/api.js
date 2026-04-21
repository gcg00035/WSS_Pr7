/**
 * api.js - Lógica de comunicación con Wikidata
 * Contiene funciones para realizar consultas SPARQL y obtener datos de batallas
 */

/**
 * Genera una consulta SPARQL para obtener batallas asociadas a un país
 * @param {string} codigoISO - Código ISO del país (ej: "ES", "FR")
 * @returns {string} Consulta SPARQL
 */
function queryGuerrasPorISO(codigoISO) {
    return `SELECT ?battle ?battleLabel ?lat ?lon
WHERE {
  # Obtener país por código ISO
  ?country wdt:P297 "${codigoISO}".

  # Batallas
  ?battle wdt:P31 wd:Q178561;
          wdt:P710 ?participant;
          wdt:P625 ?coords.

  # Participante asociado al país
  ?participant wdt:P17 ?country.

  BIND(geof:latitude(?coords) AS ?lat)
  BIND(geof:longitude(?coords) AS ?lon)

  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "es,en".
  }
}
LIMIT ${QUERY_LIMIT}`;
}

/**
 * Realiza una consulta SPARQL a Wikidata
 * @param {string} endpointUrl - URL del endpoint SPARQL
 * @param {string} sparqlQuery - Consulta SPARQL
 * @param {function} doneCallback - Función a ejecutar cuando se complete la consulta
 * @returns {object} Objeto jQuery AJAX
 */
function makeSPARQLQuery(endpointUrl, sparqlQuery, doneCallback) {
    console.log("📡 Consultando Wikidata...");
    return $.ajax(endpointUrl, {
        headers: { Accept: 'application/sparql-results+json' },
        data: { query: sparqlQuery }
    }).done(doneCallback)
      .fail(function(error) {
          console.error("❌ Error SPARQL:", error);
          $('#status').html('<span class="error">Error en la consulta</span>');
      });
}

/**
 * Obtiene los resultados de batallas desde la respuesta SPARQL
 * @param {object} data - Respuesta JSON de SPARQL
 * @returns {array} Array de batallas con coordenadas parseadas
 */
function procesarResultadosBatallas(data) {
    console.log("📊 Respuesta SPARQL recibida:", data);
    
    if (!data.results || !data.results.bindings) {
        console.error("❌ Error: No hay resultados en la respuesta SPARQL");
        return [];
    }

    console.log("📋 Total de resultados SPARQL:", data.results.bindings.length);

    var batallas = data.results.bindings.map(function(batalla) {
        return {
            nombre: batalla.battleLabel?.value || "Batalla",
            lat: parseFloat(batalla.lat.value),
            lon: parseFloat(batalla.lon.value)
        };
    }).filter(function(batalla) {
        return !isNaN(batalla.lat) && !isNaN(batalla.lon);
    });

    console.log("✅ Batallas procesadas:", batallas.length, batallas);
    return batallas;
}
