// Initialize map
const map = L.map('map').setView([46.870, -113.995], 13);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Load RouteWISELY GeoJSON from GCP
const geojsonURL = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";

fetch(geojsonURL)
  .then(response => {
    if (!response.ok) throw new Error("Failed to load GeoJSON");
    return response.json();
  })
  .then(data => {
    // Add GeoJSON to the map
    const geoLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#00cc44",
          color: "#006622",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        const popupContent = `
          <strong>Segment ID:</strong> ${props.segment_id}<br/>
          <strong>Sequence:</strong> ${props.sequence_id}<br/>
          <strong>Bearing From:</strong> ${props.bearing_from}<br/>
          <strong>Bearing To:</strong> ${props.bearing_to}
        `;
        layer.bindPopup(popupContent);
      }
    }).addTo(map);

    map.fitBounds(geoLayer.getBounds()); // Zoom to fit features
  })
  .catch(err => {
    console.error("GeoJSON load failed:", err);
    alert("Failed to load route data. Check console for details.");
  });
