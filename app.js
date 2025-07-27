// RouteWISELY - Missoula v1 MVP (with GPS drift, visited/missed tracking, logging)
// Author: ron-tcr2025 + Copilot PRO
// Requirements: Leaflet, LocateControl, MarkerCluster

const GEOJSON_URL = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";
const VISITED_KEY = "visitedStops-missoula-v1";
const MISSED_KEY = "missedStops-missoula-v1";
const PROXIMITY_RADIUS = 50; // meters for forgiving GPS/lane drift
const BEHIND_ANGLE_THRESHOLD = 110; // degrees, for "passed" markers
const MISSED_ANGLE_THRESHOLD = 150; // for missed marker logic

let map = L.map('map', {
  zoomControl: true,
  attributionControl: true,
  tap: true // Better mobile support
}).setView([46.87, -113.99], 13);

let geoLayer, markerCluster, allStops = [], userMarker = null, nextStop = null;
let visitedStops = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));
let missedStops = new Set(JSON.parse(localStorage.getItem(MISSED_KEY) || "[]"));
let lastUserLatLng = null, lastUserLatLng2 = null;
let locateControl;
let arrowLine = null;

// Helper: Save visited/missed
function saveVisited() {
  localStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(visitedStops)));
}
function saveMissed() {
  localStorage.setItem(MISSED_KEY, JSON.stringify(Array.from(missedStops)));
}

// Helper: Distance in meters
function distanceMeters(a, b) {
  return map.distance([a.lat, a.lng], [b.lat, b.lng]);
}

// Helper: Compass bearing (degrees) from 'from' to 'to'
function getBearing(from, to) {
  let lat1 = from.lat * Math.PI / 180;
  let lat2 = to.lat * Math.PI / 180;
  let dLng = (to.lng - from.lng) * Math.PI / 180;
  let y = Math.sin(dLng) * Math.cos(lat2);
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// Helper: Angle difference (0-180)
function angleDifference(a, b) {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Marker styling logic
function getMarkerStyle(feature, visited, isNext = false, isCurrent = false, isMissed = false) {
  if (isMissed) {
    return { radius: 7, color: "#b80000", fillColor: "#ffb3b3", fillOpacity: 0.8, weight: 2 };
  }
  if (isCurrent) {
    return { radius: 9, color: "#0054b9", fillColor: "#3fbbfe", fillOpacity: 1, weight: 3 };
  }
  if (isNext) {
    return { radius: 9, color: "#0074d9", fillColor: "#fff", fillOpacity: 1, weight: 3 };
  }
  if (visited) {
    return { radius: 6, color: "green", fillColor: "#0c0", fillOpacity: 0.9, weight: 2 };
  }
  // Not visited
  return { radius: 6, color: "red", fillColor: "#f03", fillOpacity: 0.85, weight: 2 };
}

// UI overlays
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
    if (visitedStops.has(marker.feature.id) || missedStops.has(marker.feature.id)) return;
    let dist = distanceMeters(userLatLng, marker.getLatLng());
    if (dist < minDist) {
      minDist = dist;
      closest = marker;
    }
  });
  return { marker: closest, distance: minDist };
}

// Update info about next stop and marker styles
function updateNextStop(userLatLng, justVisitedId = null) {
  const nextStopInfo = document.getElementById('nextStopInfo');
  if (allStops.length && visitedStops.size + missedStops.size >= allStops.length) {
    if (nextStopInfo) nextStopInfo.innerHTML = "All stops visited or missed!";
    nextStop = null;
    allStops.forEach(m => m.setStyle(getMarkerStyle(m.feature, visitedStops.has(m.feature.id), false, false, missedStops.has(m.feature.id))));
    updateVisitedMissedLog();
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
        let isMissed = missedStops.has(m.feature.id);
        m.setStyle(getMarkerStyle(m.feature, visitedStops.has(m.feature.id), isNext, isCurrent, isMissed));
      });
      info = `Next stop: <b>${marker.feature.properties.name || marker.feature.id}</b> (${distance.toFixed(0)} m)`;
    } else {
      nextStop = null;
    }
  }
  if (nextStopInfo) nextStopInfo.innerHTML = info;
  updateVisitedMissedLog();
}

// Draw arrow to next stop
function updateArrow(userLatLng) {
  if (arrowLine) map.removeLayer(arrowLine);
  if (nextStop && userLatLng) {
    arrowLine = L.polyline(
      [userLatLng, nextStop.getLatLng()],
      { color: "#0074d9", dashArray: "6,8", weight: 3 }
    ).addTo(map);
  }
}

// Check and colorize passed stops (visited/missed logic)
function checkAndColorizeStops(userLatLng, prevLatLng) {
  if (!prevLatLng) return;
  let travelBearing = getBearing(prevLatLng, userLatLng);
  let didVisit = false;
  let didMiss = false;
  allStops.forEach(marker => {
    const id = marker.feature.id;
    if (visitedStops.has(id) || missedStops.has(id)) return;
    let stopLatLng = marker.getLatLng();
    let dist = distanceMeters(userLatLng, stopLatLng);
    let stopBearing = getBearing(userLatLng, stopLatLng);
    let relativeAngle = angleDifference(travelBearing, stopBearing);
    // Visited: passed within buffer and "behind"
    if (dist <= PROXIMITY_RADIUS && relativeAngle > BEHIND_ANGLE_THRESHOLD) {
      visitedStops.add(id);
      marker.setStyle(getMarkerStyle(marker.feature, true));
      didVisit = true;
    }
    // Missed: passed well behind, but not visited
    else if (dist > PROXIMITY_RADIUS && relativeAngle > MISSED_ANGLE_THRESHOLD) {
      missedStops.add(id);
      marker.setStyle(getMarkerStyle(marker.feature, false, false, false, true));
      didMiss = true;
    }
  });
  if (didVisit) saveVisited();
  if (didMiss) saveMissed();
}

// Log visited/missed markers to overlay
function updateVisitedMissedLog() {
  let visitedArr = Array.from(visitedStops);
  let missedArr = Array.from(missedStops);
  let visitedCount = document.getElementById("visitedCount");
  let visitedList = document.getElementById("visitedList");
  let missedCount = document.getElementById("missedCount");
  let missedList = document.getElementById("missedList");
  if (visitedCount) visitedCount.textContent = visitedArr.length;
  if (visitedList) visitedList.textContent = visitedArr.slice(0, 10).join(", ") + (visitedArr.length > 10 ? "..." : "");
  if (missedCount) missedCount.textContent = missedArr.length;
  if (missedList) missedList.textContent = missedArr.slice(0, 10).join(", ") + (missedArr.length > 10 ? "..." : "");
}

// Add OSM tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Locate control: keep map centered on phone/driver
locateControl = L.control.locate({
  setView: 'always',
  flyTo: true,
  initialZoomLevel: 16,
  drawCircle: true,
  keepCurrentZoomLevel: false,
  showPopup: false,
  strings: { title: "Center map on your location" }
}).addTo(map);
locateControl.start();

// Marker cluster for performance
markerCluster = L.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 40,
  disableClusteringAtZoom: 17
});

// Load and render GeoJSON points (with robust error messaging for mobile)
showLoading("Loading route data (43MB)... Please wait. Large files may take time to load on mobile.");
fetch(GEOJSON_URL)
  .then(res => {
    if (!res.ok) throw new Error("GeoJSON fetch failed: " + res.statusText);
    return res.json();
  })
  .then(data => {
    let idCounter = 0;
    geoLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        feature.id = feature.id || (feature.properties.id || ("stop-" + (idCounter++)));
        let visited = visitedStops.has(feature.id);
        let missed = missedStops.has(feature.id);
        let marker = L.circleMarker(latlng, getMarkerStyle(feature, visited, false, false, missed));
        marker.feature = feature;
        // On mobile, use touchstart for marker selection
        marker.on("click touchstart", function () {
          if (!visitedStops.has(feature.id) && !missedStops.has(feature.id)) {
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
    updateVisitedMissedLog();
  })
  .catch(error => {
    showLoading("Failed to load route data. Please check your connection or try again later.");
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

// Reset stops/log
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.onclick = function () {
    if (confirm("Reset all visited stops?")) {
      visitedStops.clear();
      missedStops.clear();
      saveVisited();
      saveMissed();
      allStops.forEach(marker => marker.setStyle(getMarkerStyle(marker.feature, false)));
      updateVisitedMissedLog();
      updateNextStop(userMarker ? userMarker.getLatLng() : null);
      // Reset driver log timestamp if needed (see index.html)
      if (window.driverLogReset) window.driverLogReset();
    }
  };
}

// Add legend
L.control({ position: 'bottomright' }).onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML = `
    <strong>Legend</strong><br>
    <span style="display:inline-block;width:12px;height:12px;background:#f03;border-radius:50%;border:1px solid red;"></span> Unvisited<br>
    <span style="display:inline-block;width:12px;height:12px;background:#0c0;border-radius:50%;border:1px solid green;"></span> Visited<br>
    <span style="display:inline-block;width:12px;height:12px;background:#fff;border-radius:50%;border:2px solid #0074d9;"></span> Next Stop<br>
    <span style="display:inline-block;width:12px;height:12px;background:#ffb3b3;border-radius:50%;border:2px solid #b80000;"></span> Missed<br>
    <span style="display:inline-block;width:18px;height:4px;background:#0074d9;margin-bottom:2px;"></span> Next Stop Arrow
  `;
  div.style.background = "rgba(255,255,255,0.93)";
  div.style.padding = "8px 12px";
  div.style.borderRadius = "6px";
  div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.14)";
  return div;
}.addTo(map);

// -- Driver log timestamp integration for multi-day tracking --
window.driverLogReset = function () {
  localStorage.removeItem("driverStart");
  let driverStart = new Date().toISOString();
  localStorage.setItem("driverStart", driverStart);
};
