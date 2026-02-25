
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC10C4bxdN5FIwFmMoW6OBVFVpsEHG09Gk",
  authDomain: "aeromenu.firebaseapp.com",
  projectId: "aeromenu",
  storageBucket: "aeromenu.appspot.com",
  messagingSenderId: "491818232587",
  appId: "1:491818232587:web:af39ef2223418f1f3f900e",
  databaseURL: "https://aeromenu-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app, auth, db, storage, rtdb };
