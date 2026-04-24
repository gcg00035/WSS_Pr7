/**
 * main.js - Orquestador del proyecto
 * Coordina los eventos de clic, las llamadas a la API y las actualizaciones del mapa
 */

// Variable para almacenar las batallas dibujadas
var batallasDibujadas = [];
var batallaSeleccionada = null;

/**
 * Actualiza el listado de batallas en el panel lateral
 * @param {array} batallas - Array de batallas a mostrar
 */
function actualizarListadoBatallas(batallas) {
    console.log("📝 Actualizando listado de batallas con:", batallas.length, "items");
    
    var listado = $('#batallasListado');
    listado.empty();

    if (batallas.length === 0) {
        console.log("⚠️ Listado vacío - mostrando mensaje");
        listado.html('<li><em>No hay batallas para mostrar</em></li>');
        return;
    }

    batallas.forEach(function(batalla, index) {
        var item = $('<li></li>')
            .text(batalla.nombre)
            .attr('data-index', index)
            .on('click', function() {
                // Restaurar color anterior del marcador y línea seleccionados
                if (batallaSeleccionada !== null && batallasDibujadas[batallaSeleccionada]) {
                    batallasDibujadas[batallaSeleccionada].marcador.setStyle({
                        color: 'yellow',
                        fillColor: 'yellow'
                    });
                    batallasDibujadas[batallaSeleccionada].linea.setStyle({
                        color: '#ff4500',
                        weight: 2,
                        opacity: 0.7
                    });
                }
                
                // Cambiar color del nuevo marcador y línea seleccionados a azul
                batallasDibujadas[index].marcador.setStyle({
                    color: '#0066ff',
                    fillColor: '#0066ff'
                });
                batallasDibujadas[index].linea.setStyle({
                    color: '#0066ff',
                    weight: 3,
                    opacity: 1
                });
                
                // Guardar índice de batalla seleccionada
                batallaSeleccionada = index;
                
                // Abrir popup de la batalla
                batallasDibujadas[index].linea.openPopup();
                
                // Resaltar el elemento del listado
                $('#batallasListado li').removeClass('active');
                $(this).addClass('active');
                
                // Centrar mapa en la batalla
                if (mapa) {
                    mapa.panTo([batalla.lat, batalla.lon]);
                }
            });
        listado.append(item);
    });
    
    console.log("✅ Listado actualizado con " + batallas.length + " batallas");
}

/**
 * Maneja la selección de un país: actualiza UI, consulta Wikidata y dibuja batallas
 * @param {string} codigoISO - Código ISO del país seleccionado
 * @param {string} nombrePais - Nombre del país seleccionado
 * @param {object} evento - Evento de clic de Leaflet con latlng
 */
function manejarSeleccionPais(codigoISO, nombrePais, evento) {
    // Resetear batalla seleccionada
    batallaSeleccionada = null;
    batallasDibujadas = [];
    
    // Actualizar interfaz
    $('#nombre-pais').text(nombrePais);
    $('#status').html('');
    
    // Limpiar listado anterior
    $('#batallasListado').empty();
    
    // Mostrar loader de carga
    $('#loader-panel').fadeIn(300);
    $('#batallasList').hide();

    // Generar consulta SPARQL
    var consulta = queryGuerrasPorISO(codigoISO);

    if (!consulta) {
        $('#status').html('<span class="error">⚠️ País no soportado</span>');
        console.log("⚠️ Código ISO no reconocido:", codigoISO);
        return;
    }

    // Realizar consulta a Wikidata
    makeSPARQLQuery(WIKIDATA_ENDPOINT, consulta, function(datos) {
        // Procesar resultados
        var batallas = procesarResultadosBatallas(datos);
        
        console.log("🔍 En manejarSeleccionPais - Batallas obtenidas:", batallas);
        console.log("✅ Batallas encontradas:", batallas.length);

        if (batallas.length === 0) {
            $('#status').html('<span class="error">❌ Sin batallas geolocalizadas</span>');
            $('#loader-panel').fadeOut(300);
            $('#batallasList').fadeIn(300);
            actualizarListadoBatallas([]);
            return;
        }

        // Actualizar estado
        $('#status').html('<span class="success">✅ ' + batallas.length + ' batallas</span>');

        // Dibujar batallas en el mapa
        var coordenadaOrigen = evento.latlng;
        batallasDibujadas = dibujarBatallas(coordenadaOrigen, batallas);
        
        // Actualizar listado de batallas
        actualizarListadoBatallas(batallas);
        
        // Ocultar loader y mostrar listado
        $('#loader-panel').fadeOut(300, function() {
            $('#batallasList').fadeIn(300);
        });
    });
}

/**
 * Punto de entrada: se ejecuta cuando el documento está listo
 */
$(document).ready(function() {
    console.log("🚀 Inicializando aplicación...");
    inicializarMapa();
});
