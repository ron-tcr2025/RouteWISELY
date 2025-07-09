// Initialize the map
const map = L.map('map').setView([46.87, -113.99], 13); // Default Missoula center

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch GeoJSON from GCP and render with red dots
fetch("https://storage.googleapis.com/tcr_munis/missoula_v1.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 4,
          color: "#ff0000",     // red border
          fillColor: "#ff0000", // red fill
          fillOpacity: 0.8,
          weight: 1
        });
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error("Error loading GeoJSON:", error);
  });

// Try to locate the user at start
map.locate({ setView: true, maxZoom: 17 });

map.on('locationfound', function (e) {
  const latlng = [e.latitude, e.longitude];

  // Add "You are here" marker
  L.marker(latlng).addTo(map)
    .bindPopup("You are here")
    .openPopup();

  // Track visited points
  L.circleMarker(latlng, {
    radius: 3,
    color: "#00ff00",
    fillColor: "#00ff00",
    fillOpacity: 0.6
  }).addTo(map);
});

// Manual "📍" button to re-center on driver
const locateBtn = L.control({ position: 'topright' });
locateBtn.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  div.innerHTML = '📍';
  div.title = "Center on driver";
  div.style.cursor = 'pointer';
  div.onclick = function () {
    map.locate({ setView: true, maxZoom: 17 });
  };
  return div;
};
locateBtn.addTo(map);

// Optional: Log error if location fails
map.on('locationerror', function (e) {
  alert("Location access denied or unavailable.");
});
