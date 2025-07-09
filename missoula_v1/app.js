// RouteWISELY - Missoula v1
// Enhanced for performance, UX, and driver safety

const GEOJSON_URL = "https://storage.googleapis.com/tcr_munis/missoula_v1.geojson";
const VISITED_KEY = "routewisely_missoula_visited_v1";

// --- Map Initialization ---
const map = L.map("map", { zoomControl: false }).setView([46.87, -113.99], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
  minZoom: 10,
}).addTo(map);

L.control.zoom({ position: "topright" }).addTo(map);

// --- Marker Icons & Styles ---
const redDot = L.circleMarker([0, 0], { radius: 6, color: "#f03", fillColor: "#f66", fillOpacity: 0.85, weight: 1 });
const greenDot = L.circleMarker([0, 0], { radius: 6, color: "#2ecc40", fillColor: "#77ff77", fillOpacity: 0.95, weight: 1 });
const nextDot = L.circleMarker([0, 0], { radius: 10, color: "#0074d9", fillColor: "#7fdbff", fillOpacity: 0.9, weight: 2 });

// --- State ---
let points = []; // [{lat, lng, id, properties, visited}]
let visited = new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"));
let nextStopIdx = null;

// --- Marker Cluster Group for performance ---
const markers = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false });
map.addLayer(markers);

// --- UI Feedback Elements ---
const statusBox = document.createElement("div");
statusBox.className = "status-box";
statusBox.innerText = "Loading route...";
document.body.appendChild(statusBox);

function setStatus(msg, isError = false) {
  statusBox.innerText = msg;
  statusBox.style.background = isError ? "#ffcccc" : "#fff";
  statusBox.style.color = isError ? "#b00" : "#222";
  if (!isError) setTimeout(() => (statusBox.innerText = ""), 3000);
}

// --- GeoJSON Fetch & Lazy Rendering ---
fetch(GEOJSON_URL)
  .then((res) => res.json())
  .then((data) => {
    points = data.features
      .filter((f) => f.geometry && f.geometry.type === "Point")
      .map((f, i) => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        id: f.properties.id || i,
        properties: f.properties || {},
        visited: visited.has(f.properties.id || i),
      }));

    renderMarkers();
    setStatus("Route loaded. Tap next stop to mark as visited.");
    focusNextStop();
  })
  .catch((err) => {
    setStatus("Failed to load route data. Check your connection.", true);
    console.error(err);
  });

function renderMarkers() {
  markers.clearLayers();
  points.forEach((pt, idx) => {
    let marker;
    if (pt.visited) {
      marker = L.circleMarker([pt.lat, pt.lng], greenDot.options);
    } else if (idx === getNextStopIdx()) {
      marker = L.circleMarker([pt.lat, pt.lng], nextDot.options);
    } else {
      marker = L.circleMarker([pt.lat, pt.lng], redDot.options);
    }
    marker.bindPopup(getPopupHtml(pt, idx), { closeButton: false });
    marker.on("click", () => handleMarkerClick(idx));
    markers.addLayer(marker);
  });
}

function getPopupHtml(pt, idx) {
  if (pt.visited) {
    return `<b>Visited stop ${idx + 1}</b><br>${pt.properties.name || ""}`;
  } else if (idx === getNextStopIdx()) {
    return `<b>Next stop</b><br>${pt.properties.name || ""}<br><button class="visit-btn" onclick="window.markVisited(${idx}); event.stopPropagation();">Mark visited</button>`;
  } else {
    return `Stop ${idx + 1}<br>${pt.properties.name || ""}`;
  }
}

// Expose for popup button
window.markVisited = function(idx) {
  markVisited(idx);
};

function handleMarkerClick(idx) {
  if (idx === getNextStopIdx() && !points[idx].visited) {
    markVisited(idx);
  }
}

function markVisited(idx) {
  points[idx].visited = true;
  visited.add(points[idx].id);
  localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
  renderMarkers();
  focusNextStop();
  setStatus("Stop marked as visited!");
}

function getNextStopIdx() {
  return points.findIndex((pt) => !pt.visited);
}

function focusNextStop() {
  const idx = getNextStopIdx();
  if (idx !== -1) {
    nextStopIdx = idx;
    const { lat, lng } = points[idx];
    map.panTo([lat, lng], { animate: true, duration: 1 });
    // Optionally display arrow or voice prompt here
  } else {
    setStatus("All stops visited! Route complete.");
  }
}

// --- Driver Location & Safety (center and direction) ---
L.control
  .locate({
    setView: "always",
    flyTo: true,
    keepCurrentZoomLevel: true,
    drawCircle: true,
    showPopup: false,
    locateOptions: { enableHighAccuracy: true },
    onLocationError: (err) => setStatus(err.message, true),
    onLocationOutsideMapBounds: (e) => setStatus("Out of bounds!", true),
    icon: "fa fa-location-arrow",
    strings: { title: "Show my location" },
  })
  .addTo(map);

map.on("locationfound", (e) => {
  // Optionally check distance to next stop for auto-visit
  const idx = getNextStopIdx();
  if (idx !== -1) {
    const dist = map.distance([e.latitude, e.longitude], [points[idx].lat, points[idx].lng]);
    if (dist < 30 && !points[idx].visited) {
      // Auto-mark as visited within 30 meters
      markVisited(idx);
      setStatus("Stop automatically marked as visited.");
    }
  }
});

// --- Optional: Directional Arrow from driver to next stop ---
function addDirectionArrow(from, to) {
  if (window._arrowLayer) map.removeLayer(window._arrowLayer);
  if (!from || !to) return;
  window._arrowLayer = L.polyline([from, to], { color: "#0074d9", weight: 3, opacity: 0.7, dashArray: "5, 10" }).addTo(map);
}

// --- Responsive Cluster Redraw on Map Move ---
map.on("moveend", () => {
  // Optionally lazy load only markers in viewport
  // markerCluster handles this internally, but for custom logic, filter points here
});

// --- Enhancements: Voice Guidance (stub), Night Mode, Backend Sync, etc. ---
// Voice: Integrate Web Speech API for spoken directions when driving
// Night Mode: Add a toggle for dark map tiles
// Backend Sync: POST visit data for team analytics and real-time support

// --- END ---
