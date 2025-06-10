# RouteWISELY - Technical Architecture Document

**Version:** 1.0 (MVP)
**Status:** Initial Draft (Deliverable 1.2)

## 1. Overview

This document outlines the technical architecture for the RouteWISELY MVP. The architecture is designed to be scalable, secure, and well-suited for rapid development using a combination of FlutterFlow, a custom web frontend, and the Google Cloud / Firebase ecosystem.

## 2. System Components

The system is composed of three main front-facing components and a unified backend.

1.  **Mobile Application (Driver):** A cross-platform app for iOS and Android built with FlutterFlow. Its primary purpose is to display assigned routes, provide navigation, and track the driver's progress.
2.  **Web Dashboard (Supervisor):** A web-based interface built with React.js. It allows supervisors to manage road networks, create and assign routes, and monitor the real-time progress of drivers.
3.  **Backend Services:** A set of serverless functions and managed services from Google Cloud and Firebase that handle business logic, data storage, and authentication.

## 3. Data Flow & Logic

### 3.1. Route Creation & Assignment

1.  **Upload:** A Supervisor uploads an ESRI Shapefile via the Web Dashboard.
2.  **Processing:** The file is sent to Google Cloud Storage. A Cloud Function is triggered, which uses a geospatial library (e.g., GDAL/OGR) to parse the shapefile's geometry and attributes.
3.  **Storage:** The parsed road segment data is stored in the `municipalRoads` collection in Cloud Firestore.
4.  **Selection:** The Supervisor selects specific road segments on the Web Dashboard to define a new route.
5.  **Optimization (MVP):** The list of selected segments is sent to another Cloud Function. This function uses the Google Maps Directions API to create a sequential, navigable path. The optimized path (a list of coordinates) is saved in a new document in the `routes` collection in Firestore.
6.  **Assignment:** The Supervisor assigns the route to a Driver by updating the route document with the driver's user ID.

### 3.2. Live Tracking & Navigation

1.  **Fetching:** The Driver's Mobile App listens for real-time updates to the `routes` collection. When a route is assigned, it fetches the route data, including the optimized path polyline.
2.  **Display:** The route is displayed on the Google Map within the app.
3.  **Tracking:** The app periodically gets the device's GPS location.
4.  **Syncing:** Each new GPS point is written to a `gpsTracks` sub-collection within the parent route document in Firestore.
5.  **Offline Persistence:** Firestore's offline capabilities ensure that if the driver loses connectivity, GPS points are cached locally on the device and automatically synced to the backend once the connection is restored.
6.  **Real-Time Updates:** Because both the Supervisor's Web Dashboard and the Driver's Mobile App are listening to the same Firestore documents, any progress (new GPS points) is reflected on both interfaces in near real-time.

## 4. Directory Structure
/
|-- .github/            # For GitHub Actions (CI/CD) workflows
|-- backend/
|   |-- functions/      # Serverless Cloud Functions (Node.js or Python)
|-- docs/
|   |-- architecture.md
|   |-- user_guides/
|-- mobile_app/         # FlutterFlow project will be exported/managed here
|-- web_dashboard/      # React
