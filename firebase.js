import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6gRkj2RYMsVkwYJsh6H3sgtZclGJ9FuA",
  authDomain: "bank-management-31294.firebaseapp.com",
  projectId: "bank-management-31294",
  storageBucket: "bank-management-31294.firebasestorage.app",
  messagingSenderId: "320032143345",
  appId: "1:320032143345:web:e046f8a65034adfad9b650",
  measurementId: "G-31G06HWP18",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);