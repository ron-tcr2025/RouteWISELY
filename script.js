
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9uanVkZC10Y3IiLCJhIjoiY21ibWIyYzZxMWJhazJscHZjc3VyNTNwNSJ9.HNj1Xnr4_GUk9b3Io9CNSg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.6856, 42.2067],
  zoom: 14
});

let routeData;
let tracking = false;
let visitedSegments = new Set();

map.on('load', () => {
  fetch('grafton_intersection_segments.geojson')
    .then(res => res.json())
    .then(data => {
      routeData = data;
      map.addSource('routes', { type: 'geojson', data: routeData });
      map.addLayer({
        id: 'route-lines',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': ['match', ['get', 'status'], 'visited', '#00cc44', '#ff0000'],
          'line-width': 4
        }
      });
    });
});

function startTracking() {
  tracking = true;
  console.log('Tracking started');
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updatePosition, err => console.error(err), {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });
  }
}

function pauseTracking() {
  tracking = false;
  console.log('Tracking paused');
}

function endTracking() {
  tracking = false;
  console.log('Tracking ended');
}

function updatePosition(position) {
  if (!tracking || !routeData) return;

  const userPoint = turf.point([position.coords.longitude, position.coords.latitude]);

  let updated = false;

  routeData.features.forEach(feature => {
    if (feature.properties.status === 'unvisited') {
      const line = turf.lineString(feature.geometry.coordinates);
      const dist = turf.pointToLineDistance(userPoint, line, { units: 'meters' });

      if (dist < 8) { // 8 meters threshold
        feature.properties.status = 'visited';
        visitedSegments.add(feature.properties.segment_id);
        updated = true;
      }
    }
  });

  if (updated) {
    map.getSource('routes').setData(routeData);
    updateStats();
  }
}

function toggleStats() {
  const stats = document.getElementById("stats");
  stats.style.display = stats.style.display === "none" ? "block" : "none";
}

function downloadGPX() {
  alert("GPX export coming soon!");
}

function updateStats() {
  const total = routeData.features.length;
  const visited = visitedSegments.size;
  const percent = ((visited / total) * 100).toFixed(1);
  document.getElementById("stats").innerHTML = `Visited: ${visited} / ${total}<br>Percent Complete: ${percent}%`;
}
