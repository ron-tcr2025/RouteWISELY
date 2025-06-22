# RouteWISELY v6 Master Codebook
...
# RouteWISELY Master CodeBook (V6)

**Version:** 6.0  
**Audience:** Developers, Maintainers, Integrators  
**Purpose:** Comprehensive technical guide for RouteWISELY MVP (V6) codebase and integrations  

---

## 🚀 What is this CodeBook?

This document serves as a single reference point for developers and engineers working on RouteWISELY.  
It outlines:
- All API integrations (Google Maps, Firebase, Firestore)
- Core logic for mobile + web + supervisor flows
- Notes on extensions, gotchas, and best practices
- File structure and where to modify what  

⚠️ **Why this matters:**  
RouteWISELY combines multiple platforms (Flutter, web, GCP) — this CodeBook helps prevent missed connections or misconfigurations across those layers.

---

## 🔑 API Integrations

### Google Maps Platform  

| API | Key |
|------|------|
| Maps Platform | `AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk`  

💡 *Notes:*  
- Restrict key to your app domains and platforms  
- Monitor quota + billing  

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
