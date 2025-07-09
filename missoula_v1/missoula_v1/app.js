const map = L.map('map').setView([46.87, -113.99], 12);

// Add base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// GCP-hosted GeoJSON public link (REPLACE THIS LINK with yours)
const geoJsonUrl = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";

// Style for route points
const geojsonMarkerOptions = {
  radius: 4,
  fillColor: "#FF4136",
  color: "#000",
  weight: 0.5,
  opacity: 1,
  fillOpacity: 0.9
};

// Fetch and render points
fetch(geoJsonUrl)
  .then(response => response.json())
  .then(data => {
    const geoLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, geojsonMarkerOptions),
      onEachFeature: (f
