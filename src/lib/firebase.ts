
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Storage
import { getAuth } from "firebase/auth"; // Import Auth

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeB_8XQV8NWFqA-Rvnn6aIKT7O_RSpFG8",
  authDomain: "elegance-boutique-m9ypf.firebaseapp.com",
  projectId: "elegance-boutique-m9ypf",
  storageBucket: "elegance-boutique-m9ypf.firebasestorage.app", // Using the .firebasestorage.app suffix as per last user input
  messagingSenderId: "589129954169",
  appId: "1:589129954169:web:aa66535b2a0672ab8135a8",
  measurementId: "G-B2YZX33FLQ"
};


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

// Initialize Analytics only if supported (runs in browser)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Firestore, Storage, and Auth
const db = getFirestore(app);
const storage = getStorage(app); // storage instance will use the firebaseConfig above
const auth = getAuth(app);


export { app, analytics, db, storage, auth }; // Export the initialized instances
