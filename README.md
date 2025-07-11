# RouteWISELY MVP adapted from Ron Judd's 2020 farm delivery routing tool, modidied for Civil engineers to collect data on raods and highways.

## Overview

RouteWISELY is a mobile-first web app for route navigation and logging, designed for drivers to efficiently track completed, missed, and upcoming stops. It uses Leaflet.js for mapping, integrates live location updates, and overlays essential route data from a public GeoJSON file.

---

## MVP Features & Requirements

### 1. **Map & Routing**
- Interactive map view using Leaflet.js and OpenStreetMap tiles.
- GeoJSON route points loaded from a Google Cloud bucket.
- All route stops rendered as clusterable map markers.
- Visited markers turn green; missed markers turn red.
- The next stop is visually distinct (blue/white marker and a polyline arrow from current location).
- Map always follows and centers on the driver’s live GPS location.
- Directionality logic ensures only forward stops are marked as visited.

### 2. **Driver Log**
- Tracks start time, current time, and elapsed driving time.
- Lists visited and missed stops (IDs/counts).
- Persistent log overlay for session tracking.
- Reset button for log and marker states.

### 3. **Mobile Responsiveness**
- UI overlays (legend, log, reset, next stop) sized and positioned for various mobile screens.
- Touch-friendly controls for reset, log, and overlays.
- Works in both portrait and landscape on Android and iOS devices.
- No horizontal scrolling required.

### 4. **Connectivity & Performance**
- Loads large (40MB+) GeoJSON files efficiently.
- Handles fetch errors gracefully with user messaging.
- Marker clustering for performance on mobile.
- Map and markers load quickly over WiFi and cellular.

### 5. **Legend & Overlays**
- Marker color legend explaining visited, missed, next, and unvisited states.
- Arrow/line legend for next stop navigation.

### 6. **Location Permissions & Compatibility**
- Requests location access from browser.
- Compatible with Chrome (Android/iOS), Safari (iOS), Edge, Firefox.
- Error handling and messaging for location permission denial.

---

## Recent Enhancements

- Improved mobile overlay layout for small and large screens.
- Added start/stop/reset functionality for driver log.
- Enhanced marker directionality logic.
- Tested large GeoJSON connectivity and error handling.
- Added persistent session tracking and overlay legend.

---

## Setup

1. Clone repo.
2. Serve `missoula_v1/index.html` via local or remote web server.
3. Ensure public access to the GeoJSON file in Google Cloud Storage.
4. Works out-of-the-box on modern mobile browsers.

---

## Future Improvements

- Accessibility enhancements (ARIA live regions for overlays).
- Service worker for offline support.
- Optional route tiling/pagination for very large datasets.
- More detailed driver stats and reporting.

---

## License

MIT
