// RouteWISELY MVP - robust mobile and desktop support, validated GeoJSON loading

const GEOJSON_URL = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";
const VISITED_KEY = "visitedStops-missoula-v1";
const PROXIMITY_RADIUS = 50; // meters
const BEHIND_ANGLE_THRESHOLD = 110; // degrees

let map, geoLayer, markerCluster, allStops = [], userMarker = null, nextStop = null;
let visitedStops = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));
let lastUserLatLng = null, lastUserLatLng2 = null, arrowLine = null;

// UI elements
const loadingIndicator = document.getElementById('loadingIndicator');
const nextStopInfo = document.getElementById('nextStopInfo');
const resetBtn = document.getElementById('resetBtn');

// Helper functions
function saveVisited() {
  localStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(visitedStops)));
}

function showLoading(msg = "Loading...") {
  if (loadingIndicator) { loadingIndicator.style.display = ""; loadingIndicator.textContent = msg; }
}
function hideLoading() {
  if (loadingIndicator) { loadingIndicator.style.display = "none"; }
}

function distanceMeters(a, b) {
  return map.distance([a.lat, a.lng], [b.lat, b.lng]);
}

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

function angleDifference(a, b) {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function getMarkerStyle(feature, visited, isNext = false, isCurrent = false) {
  if (isCurrent) {
    return { radius: 8, color: "#0054b9", fillColor: "#3fbbfe", fillOpacity: 1, weight: 3 };
  }
  if (isNext) {
    return { radius: 8, color: "#0074d9", fillColor: "#fff", fillOpacity: 1, weight: 3 };
  }
  if (visited) {
    return { radius: 5, color: "green", fillColor: "#0c0", fillOpacity: 0.9, weight: 1 };
  }
  return { radius: 5, color: "red", fillColor: "#f03", fillOpacity: 0.8, weight: 1 };
}

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

function updateNextStop(userLatLng, justVisitedId = null) {
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

function updateArrow(userLatLng) {
  if (arrowLine) map.removeLayer(arrowLine);
  if (nextStop && userLatLng) {
    arrowLine = L.polyline(
      [userLatLng, nextStop.getLatLng()],
      { color: "#0074d9", dashArray: "6,8", weight: 2 }
    ).addTo(map);
  }
}

function checkAndColorizeStops(userLatLng, prevLatLng) {
  if (!prevLatLng) return;
  let travelBearing = getBearing(prevLatLng, userLatLng);
  let didVisit = false;
  allStops.forEach(marker => {
    if (visitedStops.has(marker.feature.id)) return;
    let stopLatLng = marker.getLatLng();
    let dist = distanceMeters(userLatLng, stopLatLng);
    if (dist <= PROXIMITY_RADIUS) {
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

// Map init
function initializeMap() {
  map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([46.87, -113.99], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Locate control
  let locateControl = L.control.locate({
    setView: 'always',
    flyTo: true,
    initialZoomLevel: 16,
    drawCircle: true,
    keepCurrentZoomLevel: false,
    showPopup: false,
    strings: { title: "Center map on your location" }
  }).addTo(map);

  locateControl.start();

  // Marker cluster
  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    disableClusteringAtZoom: 17
  });

  map.addLayer(markerCluster);

  map.on('locationfound', onLocationFound);

  // Legend
  L.control({ position: 'bottomright' }).onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
      <strong>Legend</strong><br>
      <span style="display:inline-block;width:12px;height:12px;background:#f03;border-radius:50%;border:1px solid red;"></span> Unvisited<br>
      <span style="display:inline-block;width:12px;height:12px;background:#0c0;border-radius:50%;border:1px solid green;"></span> Visited<br>
      <span style="display:inline-block;width:12px;height:12px;background:#fff;border-radius:50%;border:2px solid #0074d9;"></span> Next Stop<br>
      <span style="display:inline-block;width:12px;height:12px;background:#3fbbfe;border-radius:50%;border:2px solid #0054b9;"></span> Just Visited<br>
      <span style="display:inline-block;width:18px;height:4px;background:#0074d9;margin-bottom:2px;"></span> Next Stop Arrow
    `;
    return div;
  }.addTo(map);
}

// Location update
function onLocationFound(e) {
  let latlng = e.latlng;
  if (!userMarker) {
    userMarker = L.circleMarker(latlng, {
      radius: 7, color: "#333", fillColor: "#00f", fillOpacity: 0.8
    }).addTo(map);
  } else {
    userMarker.setLatLng(latlng);
  }
  if (lastUserLatLng) lastUserLatLng2 = lastUserLatLng;
  lastUserLatLng = latlng;
  checkAndColorizeStops(latlng, lastUserLatLng2);
  updateNextStop(latlng);
  updateArrow(latlng);
}

// Fetch and render GeoJSON
function loadGeoJSON() {
  showLoading("Loading route data...");
  fetch(GEOJSON_URL)
    .then(res => {
      if (!res.ok) throw new Error(`Network response was not ok (${res.status})`);
      return res.json();
    })
    .then(data => {
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
      hideLoading();
      if (!allStops.length) {
        showLoading("No stops found in GeoJSON!");
        setTimeout(hideLoading, 3500);
      }
    })
    .catch(error => {
      showLoading("Failed to load route data.");
      console.error("GeoJSON fetch error:", error);
      setTimeout(hideLoading, 4500);
    });
}

// Reset logic
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

// App entrypoint
window.onload = function () {
  initializeMap();
  loadGeoJSON();
  if (nextStopInfo) nextStopInfo.innerHTML = "Finding your next stop... Stand by.";
};
