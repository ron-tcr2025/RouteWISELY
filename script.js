
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9uanVkZC10Y3IiLCJhIjoiY21ibWIyYzZxMWJhazJscHZjc3VyNTNwNSJ9.HNj1Xnr4_GUk9b3Io9CNSg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.6856, 42.2067],
  zoom: 13
});

let tracking = false, paused = false;

map.on('load', () => {
  map.addSource('routes', { type: 'geojson', data: 'grafton_sample_routes.geojson' });
  map.addLayer({
    id: 'route-lines',
    type: 'line',
    source: 'routes',
    paint: { 'line-color': '#ff0000', 'line-width': 4 }
  });
});

function startTracking() { tracking = true; paused = false; console.log('Tracking started'); }
function pauseTracking() { paused = true; console.log('Tracking paused'); }
function endTracking() { tracking = false; console.log('Tracking ended'); }
function toggleStats() {
  const stats = document.getElementById("stats");
  stats.style.display = stats.style.display === "none" ? "block" : "none";
}
function downloadGPX() { alert("GPX export coming soon!"); }
