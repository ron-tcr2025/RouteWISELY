// Initialize map
const map = L.map('map').setView([46.87, -113.99], 13);

// Load base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Add Locate control to center on user
L.control.locate({
  setView: 'once',
  flyTo: true,
  initialZoomLevel: 16,
  drawCircle: false,
  icon: 'fa fa-location-arrow',
  strings: {
    title: "Center map on your location"
  }
}).addTo(map).start();

// Load GeoJSON from public GCP URL
fetch("https://storage.googleapis.com/tcr_munis/missoula_v1.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 4,
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.8
        });
      }
    }).addTo(map);
  })
  .catch(error => {
    alert("Failed to load route data. Check console for details.");
    console.error(error);
  });
