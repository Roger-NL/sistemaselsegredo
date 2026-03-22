// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
const shouldEnableAnalytics = Boolean(measurementId && measurementId !== "G-12345");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA1oFS8KrjQHaD8VPizOMySnpVDnv1Dang",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "esenglishacad.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "esenglishacad",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "esenglishacad.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "712293250318",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:712293250318:web:5ec896a9cd7b75ba27d35f",
  measurementId: measurementId || undefined
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (Safe init for SSR)
let analytics;
if (typeof window !== "undefined" && shouldEnableAnalytics) {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;
