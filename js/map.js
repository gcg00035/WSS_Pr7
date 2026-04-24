/**
 * map.js - Lógica pura de Leaflet
 * Contiene funciones para inicializar el mapa, cargar GeoJSON, dibujar polilíneas y círculos
 */

// Variable global para almacenar el mapa e instancias de capas
let mapa;
let capaBatallas = L.layerGroup();
let capaPaises;

/**
 * Inicializa el mapa de Leaflet con la capa base y el GeoJSON de países
 */
function inicializarMapa() {
    // Crear mapa centrado en coordenadas iniciales
    mapa = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

    // Añadir capa base de CartoDB Dark
    L.tileLayer(MAP_CONFIG.tileLayer, {
        attribution: MAP_CONFIG.attribution
    }).addTo(mapa);

    // Añadir capa de batallas
    capaBatallas.addTo(mapa);

    // Cargar GeoJSON con países
    cargarGeoJSON();
}

/**
 * Carga el GeoJSON de países y añade interactividad
 */
function cargarGeoJSON() {
    $.getJSON(GEOJSON_URL, function(data) {
        console.log("✅ GeoJSON cargado. Total países:", data.features.length);

        capaPaises = L.geoJson(data, {
            style: GEOJSON_STYLE,
            onEachFeature: function(feature, layer) {
                // Evento de clic en país
                layer.on('click', function(evento) {
                    var codigoISO = feature.properties.ISO_A2;
                    var nombrePais = feature.properties.NAME;

                    console.log("📍 País seleccionado - ISO:", codigoISO, "Nombre:", nombrePais);

                    if (!codigoISO || codigoISO === '-99') {
                        $('#status').text("⚠️ Este país no tiene código ISO");
                        return;
                    }

                    manejarSeleccionPais(codigoISO, nombrePais, evento);
                });

                // Efecto hover
                layer.on('mouseover', function() {
                    this.setStyle({ fillOpacity: 0.5 });
                });
                layer.on('mouseout', function() {
                    this.setStyle({ fillOpacity: GEOJSON_STYLE.fillOpacity });
                });
            }
        }).addTo(mapa);

        // Ocultar splash screen después de que cargue el GeoJSON
        setTimeout(function() {
            $('#splash-screen').fadeOut(600);
        }, 500);

    }).fail(function(error) {
        console.error("❌ Error cargando GeoJSON:", error);
        $('#status').text("Error cargando el mapa");
        // Ocultar splash screen incluso si hay error
        $('#splash-screen').fadeOut(600);
    });
}

/**
 * Dibuja líneas de guerra desde el punto de clic hasta las batallas
 * @param {object} origenClic - Punto de clic con propiedades latlng
 * @param {array} batallas - Array de batallas con lat, lon y nombre
 * @returns {array} Array de batallas dibujadas
 */
function dibujarBatallas(origenClic, batallas) {
    // Limpiar batallas previas
    capaBatallas.clearLayers();

    if (batallas.length === 0) {
        console.log("⚠️ No hay batallas para dibujar");
        return [];
    }

    var batallasDibujadas = [];

    // Dibujar cada batalla
    batallas.forEach(function(batalla, index) {
        // Dibuja línea de conexión desde origen hasta batalla
        var linea = L.polyline([origenClic, [batalla.lat, batalla.lon]], POLYLINE_CONFIG)
            .addTo(capaBatallas)
            .bindPopup(`<b>${batalla.nombre}</b><br><i>Coordenadas: ${batalla.lat.toFixed(2)}, ${batalla.lon.toFixed(2)}</i>`);

        // Dibuja círculo marcador en la ubicación de la batalla
        var marcador = L.circleMarker([batalla.lat, batalla.lon], CIRCLE_MARKER_CONFIG)
            .addTo(capaBatallas)
            .bindPopup(`<b>${batalla.nombre}</b><br><i>Coordenadas: ${batalla.lat.toFixed(2)}, ${batalla.lon.toFixed(2)}</i>`);

        // Agregar evento de clic al marcador
        marcador.on('click', function() {
            seleccionarBatallaEnMapa(index, batalla);
        });

        batallasDibujadas.push({
            nombre: batalla.nombre,
            lat: batalla.lat,
            lon: batalla.lon,
            linea: linea,
            marcador: marcador
        });
    });

    // Ajustar zoom al área de batallas
    if (mapa && capaBatallas && capaBatallas.getLayers().length > 0) {
        try {
            var bounds = capaBatallas.getBounds();
            if (bounds.isValid()) {
                mapa.fitBounds(bounds);
            }
        } catch (e) {
            console.error("⚠️ Error al ajustar zoom:", e);
        }
    }

    return batallasDibujadas;
}

/**
 * Maneja la selección de un marcador de batalla
 * @param {number} index - Índice de la batalla seleccionada
 * @param {object} batalla - Objeto de batalla con lat, lon, etc
 */
function seleccionarBatallaEnMapa(index, batalla) {
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
    
    // Resaltar en el listado
    $('#batallasListado li').removeClass('active');
    $('#batallasListado li[data-index="' + index + '"]').addClass('active');
}

/**
 * Obtiene las coordenadas del punto central clickeado
 * @returns {object} Objeto con propiedades lat y lon
 */
function obtenerCoordenadaPaís(evento) {
    if (evento && evento.latlng) {
        return evento.latlng;
    }
    return null;
}
