# 🚀 RouteWISELY V6 – Project Setup Guide

## 1️⃣ Repository Overview

RouteWISELY_v6/
├── map_v6.dart # Flutter Google Maps + GPS tracking + Directions + Firestore sync
├── driver_tracking_v6.js # Cloud Function stub for GPS point handling (optional)
├── end_project_v6.js # Cloud Function stub for marking project completion
├── firestore_structure_v6.json # Firestore collections, sample docs + indexes
├── supervisor_map_v6.html # Supervisor dashboard: real-time view + download
├── README_v6.md # Main README file
├── RouteWISELY_Master_Codebook_v6.md # Dev guide: APIs, structure, notes
├── assets_v6/ # Diagrams: data flow, screen flow, security
├── help_v6/ # Per-screen help docs
└── docs/ # Additional docs (e.g., architecture, license)

markdown
Copy
Edit

---

## 2️⃣ Prerequisites

- Flutter SDK (3.x+)
- Node.js (for Firebase CLI / Cloud Functions)
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (`gcloud`)
- API keys:
  - Maps Platform API Key
  - Android Key
  - iOS Key
  - Browser Key
- GCP billing + enabled APIs:
  - Firestore
  - Maps JavaScript API
  - Maps SDK Android/iOS
  - Directions API

---

## 3️⃣ Firebase & GCP Configuration

✅ **Firestore**
- Enable offline persistence (driver app)
- Set security rules:
  - Drivers: write `driver_tracking`, read own project
  - Supervisors: read `driver_tracking`, manage `projects`
  - Admins: full access

✅ **Firestore indexes**
- `driver_tracking`: `timestamp` (asc), composite `latitude+longitude`
- `projects`: `status`, `driver`, `municipality`
- `supervisors`: `email`

✅ **Maps API**
- Restrict API keys to platforms (web, Android, iOS)
- Add SHA fingerprint for Android Maps Auth

---

## 4️⃣ Mobile App (Driver)

```bash
git clone https://github.com/your-org/RouteWISELY.git
cd RouteWISELY
flutter pub get
flutter run --flavor driver -t lib/map_v6.dart
Add API keys to Android AndroidManifest.xml / iOS Info.plist

Ensure google-services.json + GoogleService-Info.plist in place

5️⃣ Supervisor Web Dashboard
Update API key + Firebase config in supervisor_map_v6.html

Replace GeoJSON URL in loadGeoJsonOverlay()

Deploy:

bash
Copy
Edit
firebase init hosting
cp supervisor_map_v6.html public/index.html
firebase deploy
6️⃣ Cloud Functions (Optional)
bash
Copy
Edit
cd functions
firebase deploy --only functions
For:

driver_tracking_v6.js: enhanced GPS write / batch ops

end_project_v6.js: auto mark project completed

7️⃣ Developer Best Practices
✅ Batch GPS writes (reduce Firestore cost)

✅ Enable offline persistence for mobile

✅ Handle Firestore errors with retries

✅ Use BigQuery export for analysis (future)

✅ Secure API keys (env vars, secrets manager)

✅ Pre-create indexes to avoid runtime warnings

8️⃣ Assets & Help
/assets_v6/

data_flow_v6.png

screen_flow_v6.png

security_layers_v6.png

/help_v6/

Per-screen help MD files

9️⃣ Next Possible Files
👉 CI_CD_PIPELINE.md – for GitHub Actions / Cloud Run
👉 BIGQUERY_INTEGRATION.md – for analytics pipeline
👉 V7_FEATURES.md – roadmap for offline routing + advanced dashboard

© 2025 CloudRiver LLC. All rights reserved.
