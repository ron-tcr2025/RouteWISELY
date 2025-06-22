// end_project_v6.js
// RouteWISELY V6 - Project completion handler (Web or hybrid app)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

async function completeProject(projectId) {
  try {
    await updateDoc(doc(db, "projects", projectId), {
      status: "completed",
      completed_at: serverTimestamp()
    });
    alert("✅ Project marked as complete!");
  } catch (error) {
    console.error("❌ Error updating project:", error);
    alert(`❌ Failed to mark project as complete: ${error.message}`);
  }
}

// Example usage: completeProject('your-project-id-here');
// You can trigger this via a button onclick
