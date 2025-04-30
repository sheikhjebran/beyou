
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage"; // Import Storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: In a real application, store these values in environment variables
// (e.g., .env.local) and access them via process.env.NEXT_PUBLIC_FIREBASE_*,
// never hardcode them directly in the source code.
const firebaseConfig = {
    apiKey: "AIzaSyBIcJ6DXZlvbBDey7CuIQmDSTJrgRL01Qg",
    authDomain: "beyou-f9842.firebaseapp.com",
    projectId: "beyou-f9842",
    storageBucket: "beyou-f9842.appspot.com", // Keep the .appspot.com for storage bucket reference
    messagingSenderId: "905906146458",
    appId: "1:905906146458:web:7949f115a605ba793b6323",
    measurementId: "G-JWNJ9W854M"
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

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);


export { app, analytics, db, storage }; // Export the initialized app, analytics, db, and storage instances
