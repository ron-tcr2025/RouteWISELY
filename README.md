# RouteWISELY - Municipal Route Optimization Application

**Version:** 1.0 (MVP)
**Project Status:** Milestone 1 - Discovery & Design

---

## 1. Introduction & Overview

RouteWISELY is a comprehensive mobile and web application designed to assist municipal public works departments in efficiently managing, executing, and tracking driving routes for tasks such as road maintenance, street sweeping, and infrastructure inspections. The application optimizes routes from ESRI Shapefiles, provides turn-by-turn navigation via Google Maps, visually tracks completed road segments, and collects GPS data for robust reporting and analysis.

## 2. Core MVP Features

The Minimum Viable Product (MVP) will focus on the following core functionalities:

* **Shapefile Integration:** Supervisors can upload ESRI Shapefiles to define the municipal road network.
* **Route Optimization:** The system calculates an optimized route to cover all selected road segments efficiently.
* **Mobile Navigation:** Drivers receive turn-by-turn navigation on iOS and Android devices powered by Google Maps.
* **Live Route Tracking:** The driver's mobile map visually differentiates completed segments from pending ones in real-time.
* **Safety Features:** The navigation system will provide alerts for known hazards like one-way streets and low bridges.
* **Supervisor Dashboard:** A web-based dashboard provides supervisors with a view of active routes, driver status, and overall progress.
* **Authentication:** Secure, role-based login for both drivers (mobile) and supervisors (web).

## 3. Technology Ecosystem

This project will be built on a modern, scalable technology stack designed for rapid development and robust performance.

* **Mobile App (iOS/Android):** Flutter via FlutterFlow
* **Web Dashboard:** React.js
* **Backend Framework:** Cloud Functions for Firebase using Node.js or Python
* **Main Database:** Cloud Firestore & Cloud SQL (PostgreSQL) with PostGIS extension
* **File & Data Syncing:** Google Cloud Storage and Firebase Cloud Firestore
* **User Authentication:** Firebase Authentication
* **Mapping & Navigation:** Google Maps Platform (SDKs, Directions API)
* **CI/CD & Hosting:** GitHub Actions, Docker, and Google Cloud Run

## 4. Getting Started

*(This section will be updated as the project progresses through the milestones.)*

**Prerequisites:**
* Node.js
* Flutter SDK
* Google Cloud SDK

**Installation & Setup:**

```bash
# Clone the repository
git clone [https://github.com/your-org/RouteWISELY.git](https://github.com/your-org/RouteWISELY.git)

# Navigate to project directory
cd RouteWISELY

# (Instructions for backend, web, and mobile setup will be added here)


## 📍 RouteWISELY Maps Integration

This repository contains integration code and documentation for using the Google Maps API in RouteWISELY.

### Codebook
👉 See [`RouteWISELY_Maps_Codebook.md`](RouteWISELY_Maps_Codebook.md) for:
- Web and mobile (Flutter) Google Maps integration patterns
- API usage examples
- Common pitfalls and gotchas
- Upload and Git instructions

### Sample Stubs
- [`map.html`](map.html) — Basic Google Maps web integration example
- [`map.dart`](map.dart) — Basic Google Maps Flutter widget

---

## 📝 Notes

# RouteWISELY - Automatic Project Start Date Derivation

## Purpose
To streamline user setup and reduce manual data entry, RouteWISELY will automatically derive the **Actual Project Start Date** based on system activity. This value will feed into all mapping, navigation, and reporting features.

## Logic
- The **actual project start date** is defined as the timestamp of the earliest relevant activity associated with the project.
- Priority:
  1️⃣ **First driver activity timestamp** (e.g. first navigation started, first location logged, first route activated)
  2️⃣ If no driver activity: **First shape file upload timestamp**

## Technical Approach
The derived date will be computed dynamically within queries to the database or during analytics report generation.

### Example logic (pseudo code / query pattern)
```pseudo
// Derive actual start date from driver activity
actualStartDate = MIN(driver_activity.timestamp)
WHERE driver_activity.project_id == currentProjectId

// Fallback if no driver activity is found
IF actualStartDate IS NULL THEN
    actualStartDate = MIN(shape_file.uploaded_at)
    WHERE shape_file.project_id == currentProjectId
END IF
```

## Reporting
- The **Actual Start Date (System Derived)** will appear in:
  - Reporting dashboards
  - PDF exports
  - Analytics summaries
- It will be clearly labeled to distinguish it from manually entered dates:
  > _Actual Start Date (System Derived)_

## Implementation Notes
- This logic will be part of the analytics query layer and should not require user input.
- Ensure database indexing on `driver_activity.timestamp` and `shape_file.uploaded_at` for performance.
- Apply consistently across:
  - Mapping views (to show when a project truly began)
  - Navigation module (for operational tracking)
  - Reporting module (for internal and external reporting)

Ensure API keys are secured using environment variables or a secrets manager.  
- Test location features on real devices and various network conditions.  
- Review API billing and quota settings in Google Cloud Console.
