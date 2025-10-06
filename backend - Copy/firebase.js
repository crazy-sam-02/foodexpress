// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxL1JlO0bhtLSf9t1mvvvK1cGDTZIYwzk",
  authDomain: "foodexpress-c09c9.firebaseapp.com",
  projectId: "foodexpress-c09c9",
  storageBucket: "foodexpress-c09c9.firebasestorage.app",
  messagingSenderId: "665515949459",
  appId: "1:665515949459:web:fec589a37080f4889c7c66",
  measurementId: "G-KF363DY8E1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();