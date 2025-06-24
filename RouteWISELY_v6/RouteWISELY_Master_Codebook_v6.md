# RouteWISELY Master CodeBook (V6)

**Version:** 6.0  
**Audience:** Developers, Maintainers, Integrators  
**Purpose:** Comprehensive technical guide for the RouteWISELY MVP (V6) codebase, integrations, and best practices  

---

## Introduction

RouteWISELY is a comprehensive mobile and web application built to assist municipal public works departments in efficiently managing, executing, and tracking driving routes for:

- Road maintenance
- Street sweeping
- Infrastructure inspections  

**Key features:**  

- Optimized routes generated from ESRI Shapefiles  
- Turn-by-turn navigation via Google Maps  
- Real-time visual tracking of completed vs. pending segments  
- GPS data collection for reporting and analytics  
- Supervisor dashboard for route oversight  

---

## Technology Ecosystem

| Component | Technology |
|------------|-------------|
| **Mobile App** | Flutter via FlutterFlow |
| **Web Dashboard** | React.js |
| **Backend** | Cloud Functions for Firebase (Node.js / Python) |
| **Database** | Cloud Firestore + Cloud SQL (PostGIS) |
| **File Storage** | Google Cloud Storage |
| **Authentication** | Firebase Authentication |
| **Mapping** | Google Maps Platform (SDKs, Directions API) |
| **CI/CD & Hosting** | GitHub Actions, Docker, Google Cloud Run |

---

## API Integrations

### Google Maps Platform  

| API | Key |
|------|------|
| Maps Platform | `AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk`  

**Notes:**  
- Restrict keys to authorized domains and app platforms  
- Monitor usage, quota, and billing  

---

### Firebase / Firestore  

```json
{
  "apiKey": "AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk",
  "authDomain": "routewisely-project.firebaseapp.com",
  "projectId": "routewisely-project",
  "storageBucket": "routewisely-project.appspot.com",
  "messagingSenderId": "110068907650",
  "appId": "1:110068907650:web:f4f643cbe22657bc52be9b"
}
```

---

## File Structure (Recommended)

```
RouteWISELY/
├── README.md
├── RouteWISELY_Master_CodeBook_v6.md
├── RouteWISELY_Maps_Codebook.md
├── map.html
├── map.dart
├── mobile/
├── web/
├── backend/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
```

---

## Core MVP Features

- Shapefile Integration: Upload ESRI Shapefiles to define municipal road networks  
- Route Optimization: Calculate optimized routes across selected segments  
- Mobile Navigation: Provide turn-by-turn directions on iOS/Android  
- Live Route Tracking: Visual feedback of completed vs. pending road segments  
- Safety Alerts: Notify drivers of hazards (one-way streets, low bridges)  
- Supervisor Dashboard: Monitor active routes, drivers, and status in real-time  
- Authentication: Secure, role-based access for drivers and supervisors  

---

## Getting Started

### Prerequisites  
- Node.js  
- Flutter SDK  
- Google Cloud SDK  

### Setup  

```bash
git clone https://github.com/your-org/RouteWISELY.git
cd RouteWISELY
# Follow detailed setup instructions in /docs for backend, web, and mobile
```

---

## Maps Integration

See `RouteWISELY_Maps_Codebook.md` for:  
- Flutter + web Google Maps integration patterns  
- API usage examples  
- Common pitfalls to avoid  
- Git usage instructions  

---

## Best Practices

- Secure API keys using environment variables or secret managers  
- Test location-based features on real devices under different conditions  
- Regularly review API quotas and billing in Google Cloud Console  
- Enforce API key restrictions to specific domains and apps  

---

## Contributing

1. Fork the repository  
2. Create your feature branch: `git checkout -b feature/my-feature`  
3. Commit your changes: `git commit -m 'Add my feature'`  
4. Push to your branch: `git push origin feature/my-feature`  
5. Open a pull request  

---

## License  
© 2025 CloudRiver LLC. All rights reserved. Terms apply.
