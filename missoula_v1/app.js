// Enhanced RouteWISELY app.js with GPS drift buffer, directionality, and efficient navigation

const GEOJSON_URL = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";
const VISITED_KEY = "visitedStops-missoula-v1";
const PROXIMITY_RADIUS = 50; // meters, forgiving buffer for GPS/lane offset
const BEHIND_ANGLE_THRESHOLD = 110; // degrees, stop must be "behind" to count as passed

let map = L.map('map').setView([46.87, -113.99], 13);
let geoLayer, markerCluster, allStops = [], userMarker = null, nextStop = null;
let visitedStops = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));
let lastUserLatLng = null;
let lastUserLatLng2 = null;
let locateControl;
let arrowLine = null;

// Helper functions
function saveVisited() {
  localStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(visitedStops)));
}

function distanceMeters(a, b) {
  return map.distance([a.lat, a.lng], [b.lat, b.lng]);
}

// Returns compass bearing in degrees from point 'from' to point 'to'
function getBearing(from, to) {
  let lat1 = from.lat * Math.PI / 180;
  let lat2 = to.lat * Math.PI / 180;
  let dLng = (to.lng - from.lng) * Math.PI / 180;
  let y = Math.sin(dLng) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// Returns smallest difference between two angles (0-180)
function angleDifference(a, b) {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Marker styling
function getMarkerStyle(feature, visited, isNext = false, isCurrent = false) {
  if (isCurrent) {
    // The stop just visited
    return { radius: 8, color: "#0054b9", fillColor: "#3fbbfe", fillOpacity: 1, weight: 3 };
  }
  if (isNext) {
    // The next stop
    return { radius: 8, color: "#0074d9", fillColor: "#fff", fillOpacity: 1, weight: 3 };
  }
  if (visited) {
    // Stops already visited
    return { radius: 5, color: "green", fillColor: "#0c0", fillOpacity: 0.9, weight: 1 };
  }
  // Not visited
  return { radius: 5, color: "red", fillColor: "#f03", fillOpacity: 0.8, weight: 1 };
}

function showLoading(msg = "Loading...") {
  const el = document.getElementById('loadingIndicator');
  if (el) { el.style.display = ""; el.textContent = msg; }
}
function hideLoading() {
  const el = document.getElementById('loadingIndicator');
  if (el) { el.style.display = "none"; }
}

// Find next unvisited stop (nearest)
function findNextStop(userLatLng) {
  let minDist = Infinity, closest = null;
  allStops.forEach(marker => {
    if (visitedStops.has(marker.feature.id)) return;
    let dist = distanceMeters(userLatLng, marker.getLatLng());
    if (dist < minDist) {
      minDist = dist;
      closest = marker;
    }
  });
  return { marker: closest, distance: minDist };
}

// Update info about next stop
function updateNextStop(userLatLng, justVisitedId = null) {
  const nextStopInfo = document.getElementById('nextStopInfo');
  if (allStops.length && visitedStops.size >= allStops.length) {
    if (nextStopInfo) nextStopInfo.innerHTML = "All stops visited!";
    nextStop = null;
    allStops.forEach(m => m.setStyle(getMarkerStyle(m.feature, true)));
    return;
  }
  let info = "Finding your next stop...";
  if (userLatLng && allStops.length) {
    let { marker, distance } = findNextStop(userLatLng);
    if (marker) {
      nextStop = marker;
      allStops.forEach(m => {
        let isNext = (m === marker);
        let isCurrent = (m.feature.id === justVisitedId);
        m.setStyle(getMarkerStyle(m.feature, visitedStops.has(m.feature.id), isNext, isCurrent));
      });
      info = `Next stop: <b>${marker.feature.properties.name || marker.feature.id}</b> (${distance.toFixed(0)} m)`;
    } else {
      nextStop = null;
    }
  }
  if (nextStopInfo) nextStopInfo.innerHTML = info;
}

// Draw arrow to next stop
function updateArrow(userLatLng) {
  if (arrowLine) map.removeLayer(arrowLine);
  if (nextStop && userLatLng) {
    arrowLine = L.polyline(
      [userLatLng, nextStop.getLatLng()],
      { color: "#0074d9", dashArray: "6,8", weight: 2 }
    ).addTo(map);
  }
}

// Check and colorize passed stops (with buffer and directionality)
function checkAndColorizeStops(userLatLng, prevLatLng) {
  if (!prevLatLng) return;
  let travelBearing = getBearing(prevLatLng, userLatLng);
  let didVisit = false;
  allStops.forEach(marker => {
    if (visitedStops.has(marker.feature.id)) return;
    let stopLatLng = marker.getLatLng();
    let dist = distanceMeters(userLatLng, stopLatLng);
    if (dist <= PROXIMITY_RADIUS) {
      // Consider bearing: is the stop behind the driver?
      let stopBearing = getBearing(userLatLng, stopLatLng);
      let relativeAngle = angleDifference(travelBearing, stopBearing);
      if (relativeAngle > BEHIND_ANGLE_THRESHOLD) {
        visitedStops.add(marker.feature.id);
        marker.setStyle(getMarkerStyle(marker.feature, true));
        didVisit = true;
      }
    }
  });
  if (didVisit) saveVisited();
}

// Add OSM tiles and controls
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

locateControl = L.control.locate({
  setView: 'always',
  flyTo: true,
  initialZoomLevel: 16,
  drawCircle: true,
  keepCurrentZoomLevel: false,
  showPopup: false,
  strings: { title: "Center map on your location" }
}).addTo(map);

// Only call once!
locateControl.start();

// Marker cluster for performance
markerCluster = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 40,
  disableClusteringAtZoom: 17
});

// Load and render GeoJSON points
showLoading("Loading route data (43MB)...");
fetch(GEOJSON_URL)
  .then(res => res.json())
  .then(data => {
    // Assign unique IDs if not present
    let idCounter = 0;
    geoLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        feature.id = feature.id || (feature.properties.id || ("stop-" + (idCounter++)));
        let visited = visitedStops.has(feature.id);
        let marker = L.circleMarker(latlng, getMarkerStyle(feature, visited));
        marker.feature = feature;
        marker.on("click", function () {
          if (!visitedStops.has(feature.id)) {
            visitedStops.add(feature.id);
            saveVisited();
            updateNextStop(userMarker ? userMarker.getLatLng() : null, feature.id);
          }
        });
        allStops.push(marker);
        return marker;
      }
    });
    markerCluster.addLayer(geoLayer);
    map.addLayer(markerCluster);
    hideLoading();
  })
  .catch(error => {
    showLoading("Failed to load route data.");
    console.error(error);
  });

// Handle user location updates
function onLocationFound(e) {
  let latlng = e.latlng;
  // Center user marker
  if (!userMarker) {
    userMarker = L.circleMarker(latlng, {
      radius: 7, color: "#333", fillColor: "#00f", fillOpacity: 0.8
    }).addTo(map);
  } else {
    userMarker.setLatLng(latlng);
  }
  // Track previous location for directionality
  if (lastUserLatLng) {
    lastUserLatLng2 = lastUserLatLng;
  }
  lastUserLatLng = latlng;

  checkAndColorizeStops(latlng, lastUserLatLng2);
  updateNextStop(latlng);
  updateArrow(latlng);
}
map.on('locationfound', onLocationFound);

// UI elements for reset
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.onclick = function () {
    if (confirm("Reset all visited stops?")) {
      visitedStops.clear();
      saveVisited();
      allStops.forEach(marker => marker.setStyle(getMarkerStyle(marker.feature, false)));
      updateNextStop(userMarker ? userMarker.getLatLng() : null);
    }
  };
}

// Optional: Add a legend (for map controls)
L.control({ position: 'bottomright' }).onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = `
    <strong>Legend</strong><br>
    <span style="display:inline-block;width:12px;height:12px;background:#f03;border-radius:50%;border:1px solid red;"></span> Unvisited<br>
    <span style="display:inline-block;width:12px;height:12px;background:#0c0;border-radius:50%;border:1px solid green;"></span> Visited<br>
    <span style="display:inline-block;width:12px;height:12px;background:#fff;border-radius:50%;border:2px solid #0074d9;"></span> Next Stop<br>
    <span style="display:inline-block;width:12px;height:12px;background:#3fbbfe;border-radius:50%;border:2px solid #0054b9;"></span> Just Visited<br>
    <span style="display:inline-block;width:18px;height:4px;background:#0074d9;margin-bottom:2px;"></span> Next Stop Arrow
  `;
  div.style.background = "rgba(255,255,255,0.93)";
  div.style.padding = "8px 12px";
  div.style.borderRadius = "6px";
  div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.14)";
  return div;
}.addTo(map);
