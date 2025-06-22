// driver_tracking_v6.js
// RouteWISELY V6 - Driver live tracking (Web or hybrid app)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk",
  authDomain: "routewisely-project.firebaseapp.com",
  projectId: "routewisely-project",
  storageBucket: "routewisely-project.appspot.com",
  messagingSenderId: "110068907650",
  appId: "1:110068907650:web:f4f643cbe22657bc52be9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let map, path = [];
let polyline;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 46.8721, lng: -113.9940 },
    zoom: 14
  });

  polyline = new google.maps.Polyline({
    map: map,
    path: path,
    strokeColor: "#0000FF",
    strokeWeight: 3
  });

  startTracking();
}

function startTracking() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      path.push(point);
      polyline.setPath(path);
      map.setCenter(point);

      addDoc(collection(db, "driver_tracking"), {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed || 0,
        accuracy: position.coords.accuracy,
        timestamp: serverTimestamp()
      });
    }, error => {
      console.error("Geolocation error:", error);
    }, {
      enableHighAccuracy: true,
      maximumAge: 0
    });
  } else {
    alert("Geolocation not supported by this browser.");
  }
}

// Call initMap via Google Maps callback
