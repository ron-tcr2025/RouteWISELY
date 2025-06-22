# RouteWISELY v6 README

# RouteWISELY - Municipal Route Optimization Application (V6)

**Version:** 6.0 (MVP)  
**Status:** Milestone 1 – Discovery & Design

---

## 📌 Overview

RouteWISELY is designed to help municipalities manage and optimize driver routes using Google Maps, ESRI Shapefiles, and Google Cloud technologies. 

Core capabilities:
- Turn-by-turn navigation
- Route tracking + completion status
- GPS point capture + analytics (Firestore)

---

## 🗺️ map_v6.dart Summary

This Dart file includes:
✅ Display of Google Map centered on Missoula, MT  
✅ Real-time GPS tracking (driver location synced to Firestore)  
✅ Polyline route from Google Directions API  
✅ Driver location + metadata recorded: latitude, longitude, speed, accuracy, timestamp  

**Firestore Collection:**  
- `driver_tracking` (stores GPS point records in real time)

---

## 🔑 API Keys

| Purpose              | API Key                                                                 |
|-----------------------|------------------------------------------------------------------------|
| Maps Platform API Key | `AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk`                              |
| Browser Key           | `AIzaSyCuLNAse57yDh4XJ5dNVdseGvG8lSENv1A`                              |
| Android Key           | `AIzaSyDni3iauyeKWBIbWh6k4_WkTTj88SaVJL8`                              |
| iOS Key               | `AIzaSyAJcNzOYDjXKvvSOikEOa-Ef0E3tBqROdA`                              |

➡️ **Notes:** API keys should be secured via environment variables/secrets managers in production. Restrict keys to specific apps and domains in GCP Console.

---

## 🏢 Integration Notes

- **Firestore**  
  The app writes driver GPS data to the `driver_tracking` collection with lat/lng, speed, accuracy, and timestamp. Ensure Firestore security rules protect this data.
  
- **FlutterFlow (FF)**  
  This Dart code integrates cleanly into FlutterFlow via custom code widgets or external build pipelines.

- **Google Cloud Platform (GCP)**  
  - Maps + Directions APIs must be enabled  
  - Billing and API quota settings should be monitored  
  - Service accounts and IAM roles should restrict access as needed  

---

## 🚀 Setup Instructions

```bash
# Clone repo
git clone https://github.com/your-org/RouteWISELY.git
cd RouteWISELY

# Ensure dependencies are installed
flutter pub get

# Run app
flutter run

## 🌐 Supervisor Map (supervisor_map_v6.html)

The `supervisor_map_v6.html` provides supervisors with a live dashboard to monitor driver progress using Google Maps + Firebase.

### ✅ Features
- Displays live driver GPS points from Firestore `driver_tracking`
- Renders completed path as polyline
- Dynamically shows % route completion + ETA
- Allows CSV download of all GPS points collected during route

### 🔑 API + Config
| Config Item            | Value                                 |
|------------------------|---------------------------------------|
| Firebase Project ID     | `routewisely-project`                |
| Firebase Storage Bucket | `routewisely-project.appspot.com`    |
| Maps API Key            | `AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk` |
| Web API Key             | `AIzaSyCuLNAse57yDh4XJ5dNVdseGvG8lSENv1A` |

⚠ **Replace in Code:**
- `loadGeoJsonOverlay()` URL → Replace `https://YOUR_DOMAIN.com/path/to/roads.geojson` with your actual GeoJSON file URL (e.g., hosted on Firebase Storage, GCP bucket, or CDN).
- `totalSegments = 100` → Replace with actual number of segments in the shapefile or calculate dynamically.

### 🛡 Security + Notes
- API keys should be secured + restricted (HTTP referrer for web).
- Ensure Firestore security rules allow supervisor read access only.
- Consider adding Firebase Authentication for supervisor login before access.
- GeoJSON + CSV downloads should be served over HTTPS.

### ⚡ Future Enhancements
- Dynamic loading of `totalSegments` based on shapefile metadata
- Offline mode caching for dashboard
- Integration with photo/GPS point data for export reports

---

## Example Firestore Structure

```json
{
  "driver_tracking": {
    "doc_id": {
      "latitude": 46.87,
      "longitude": -113.99,
      "timestamp": "2025-06-23T12:00:00Z",
      "speed": 25,
      "accuracy": 5
    }
  }
}
