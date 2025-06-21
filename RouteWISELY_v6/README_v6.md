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
