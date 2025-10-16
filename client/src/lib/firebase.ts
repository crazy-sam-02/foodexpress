import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxL1JlO0bhtLSf9t1mvvvK1cGDTZIYwzk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "foodexpress-c09c9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "foodexpress-c09c9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "foodexpress-c09c9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "665515949459",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:665515949459:web:fec589a37080f4889c7c66",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KF363DY8E1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Optional: Configure Google provider with additional scopes
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;