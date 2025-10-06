// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-agLr_hc7AHhJuRboJLNnycQCJ9sPGCA",
  authDomain: "foodexpress-db22c.firebaseapp.com",
  projectId: "foodexpress-db22c",
  storageBucket: "foodexpress-db22c.firebasestorage.app",
  messagingSenderId: "670762465237",
  appId: "1:670762465237:web:cd1f1d4ade92a7036f6f5c",
  measurementId: "G-DS7X1C9XWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth instance
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // contains user info
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};
