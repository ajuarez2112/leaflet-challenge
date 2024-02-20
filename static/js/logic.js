// Creating the map object
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2.5
});

// Create the first tile layer (OpenStreetMap)
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the second tile layer (Google Satellite)
var googleSatelliteLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: 'Map data &copy; Google'
});

// Add the first tile layer to the map by default
osmLayer.addTo(myMap);

// Create a button to toggle between tile layers
var button = L.control({ position: 'topleft' });

button.onAdd = function (map) {
    var btnDiv = L.DomUtil.create('div', 'toggle-button');
    btnDiv.innerHTML = '<button onclick="toggleTileLayers()">Toggle Layers</button>';
    return btnDiv;
};

button.addTo(myMap);

// Function to toggle between tile layers
function toggleTileLayers() {
    if (myMap.hasLayer(osmLayer)) {
        myMap.removeLayer(osmLayer);
        googleSatelliteLayer.addTo(myMap);
    } else {
        myMap.removeLayer(googleSatelliteLayer);
        osmLayer.addTo(myMap);
    }
}

// Load the GeoJSON data
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define function to calculate marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
    return magnitude * 5;
}

// Define function to calculate marker color based on earthquake depth
function getMarkerColor(depth) {
    if (depth >= -10 && depth <= 10) {
        return "#00FF00"; // -10 to 10 km depth
    } else if (depth > 10 && depth <= 30) {
        return "#dcf400"; // 10 to 30 km depth
    } else if (depth > 30 && depth <= 50) {
        return "#f7db11"; // 30 to 50 km depth
    } else if (depth > 50 && depth <= 70) {
        return "#fdb72a"; // 50 to 70 km depth
    } else if (depth > 70 && depth <= 90) {
        return "#fca35d"; // 70 to 90 km depth
    } else {
        return "#FF0000"; // 90+ km depth
    }
}

// Get the data with d3
d3.json(geoData).then(function (data) {
    console.log(data);

    // Loop through the data and create variables for coordinates, magnitude and depth
    data.features.forEach(function (feature) {
        var coordinates = feature.geometry.coordinates;
        var magnitude = feature.properties.mag;
        var depth = coordinates[2]; // Depth is the third coordinate

        // Add circle markers to the map
        if (coordinates) {
            L.circleMarker([coordinates[1], coordinates[0]], {
                radius: getMarkerSize(magnitude),
                fillColor: getMarkerColor(depth),
                color: "Black",
                weight: 1.5,
                opacity: 1,
                fillOpacity: 1
            }).bindPopup(`<b>Location:</b> ${feature.properties.place}<br><b>Coordinates:</b> ${feature.geometry.coordinates[1]} , ${feature.geometry.coordinates[0]}<br><b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`).addTo(myMap);
        }
    });

    // Create a legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.style.width = '225px'; // Set width 
        div.style.height = '250px' // Set height
        div.style.backgroundColor = 'White'; // Set white background
        div.style.fontSize = '24px'; // Set font size

        // Add legend title
        div.innerHTML += '<b>Depths</b><br>';

        var depths = [-10, 10, 30, 50, 70, 90];

        // Initialize counters for each depth range
        var counts = new Array(depths.length + 1).fill(0);

        // Loop through earthquakes to count within each depth range
        data.features.forEach(function (feature) {
            var depth = feature.geometry.coordinates[2];
            for (var i = 0; i < depths.length; i++) {
                if (depth >= depths[i] && (depths[i + 1] === undefined || depth < depths[i + 1])) {
                    counts[i]++;
                    break;
                }
            }
        });

        // Loop through depth intervals to create legend HTML
        for (var i = 0; i < depths.length; i++) {
            var depthRange;
            if (i === depths.length - 1) {
                depthRange = depths[i] + '+';
            } else {
                depthRange = depths[i] + '&ndash;' + depths[i + 1];
            }

            div.innerHTML +=
                '<span style="display:inline-block; width:20px; height:20px; background-color:' + getMarkerColor((depths[i] + depths[i + 1]) / 2) + '; margin-right: 5px; margin-bottom: -5px;"></span>' +
                '<span style="font-size:16px;">' + depthRange + ' km: ' + counts[i] + '</span><br>';
        }

        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);

});
