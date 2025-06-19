
# RouteWISELY - Municipal Route Optimization Application

**Version:** 1.0 (MVP)  
**Project Status:** Milestone 1 - Discovery & Design

---

## 1️⃣ Introduction & Overview
RouteWISELY is a comprehensive mobile and web application built to assist municipal public works departments in efficiently managing, executing, and tracking driving routes for activities such as:
- Road maintenance
- Street sweeping
- Infrastructure inspections

Key highlights:
- Optimizes routes from ESRI Shapefiles
- Provides turn-by-turn navigation via Google Maps
- Tracks completed road segments visually
- Collects GPS data for reporting and analytics

---

## 2️⃣ Core MVP Features
- **Shapefile Integration:** Upload ESRI Shapefiles to define the municipal road network.
- **Route Optimization:** Calculate optimized routes covering selected segments efficiently.
- **Mobile Navigation:** Turn-by-turn directions on iOS/Android using Google Maps.
- **Live Route Tracking:** Real-time visual tracking of completed vs. pending segments.
- **Safety Features:** Alerts for hazards like one-way streets and low bridges.
- **Supervisor Dashboard:** Web dashboard for active routes, driver status, and progress.
- **Authentication:** Secure, role-based login (drivers & supervisors).

---

## 3️⃣ Technology Ecosystem
- **Mobile App:** Flutter via FlutterFlow
- **Web Dashboard:** React.js
- **Backend:** Cloud Functions for Firebase (Node.js / Python)
- **Database:** Cloud Firestore & Cloud SQL (PostGIS)
- **File Storage:** Google Cloud Storage
- **Authentication:** Firebase Authentication
- **Mapping:** Google Maps Platform (SDKs + Directions API)
- **CI/CD & Hosting:** GitHub Actions, Docker, Google Cloud Run

---

## 4️⃣ RouteWISELY Maps Integration
This repository includes documentation and code for Google Maps API integration.

### Codebook
📄 [`RouteWISELY_Maps_Codebook.md`](RouteWISELY_Maps_Codebook.md) covers:
- Web + mobile (Flutter) integration patterns
- API usage examples
- Common pitfalls / gotchas
- Upload + Git instructions

### Sample Stubs
- [`map.html`](map.html) — Web Google Maps example
- [`map.dart`](map.dart) — Flutter Google Maps widget

---

## 5️⃣ Getting Started
### Prerequisites
- Node.js
- Flutter SDK
- Google Cloud SDK

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/RouteWISELY.git

cd RouteWISELY

# Follow setup instructions in /docs for backend, web, and mobile
```

---

## 6️⃣ Notes
✅ Secure API keys with environment variables or secrets managers  
✅ Test location features on real devices and under varying conditions  
✅ Review API billing + quota settings in Google Cloud Console  
✅ Restrict API keys to domains / apps you control  

---

## 7️⃣ File Structure (Recommended)
```
RouteWISELY/
├── RouteWISELY_Maps_Codebook.md
├── map.html
├── map.dart
├── mobile/
├── web/
├── backend/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
└── README.md
```

---

## 8️⃣ Contributing
1️⃣ Fork the repo  
2️⃣ Create your feature branch: `git checkout -b feature/my-feature`  
3️⃣ Commit changes: `git commit -m 'Add my feature'`  
4️⃣ Push to branch: `git push origin feature/my-feature`  
5️⃣ Open a pull request  

---

## 9️⃣ License
© 2025 CloudRiver LLC. All rights reserved. Terms apply.
