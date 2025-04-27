// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: In a real application, store these values in environment variables
// (e.g., .env.local) and access them via process.env.NEXT_PUBLIC_FIREBASE_*,
// never hardcode them directly in the source code.
const firebaseConfig = {
  apiKey: "AIzaSyAZN31awa29P4MS5uFN2sMZ7G9B1DsYTZw",
  authDomain: "beyou-a4723.firebaseapp.com",
  projectId: "beyou-a4723",
  storageBucket: "beyou-a4723.firebasestorage.app",
  messagingSenderId: "70655659032",
  appId: "1:70655659032:web:68c808f7c2b2b1ee59876d",
  measurementId: "G-7E3HPMN496"
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


export { app, analytics }; // Export the initialized app and analytics instance
