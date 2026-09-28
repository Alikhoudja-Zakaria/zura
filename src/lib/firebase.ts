import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrImKGuy4zpUccOH8O75HygjFck2xaiM4",
  authDomain: "algdate-2fc12.firebaseapp.com",
  projectId: "algdate-2fc12",
  storageBucket: "algdate-2fc12.firebasestorage.app",
  messagingSenderId: "787702493222",
  appId: "1:787702493222:web:37f9a595ea2f0f78d736e7",
  measurementId: "G-3X7W71SXCP",
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
