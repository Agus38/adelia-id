
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
  databaseURL: "https://aeromenu.firebaseio.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// --- Activity Logging ---
export const logActivity = async (action: string, target: string) => {
    const user = auth.currentUser;
    if (!user) return; // Don't log if user is not authenticated

    try {
        await addDoc(collection(db, 'activityLogs'), {
            userId: user.uid,
            userName: user.displayName || user.email,
            userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'A')}&background=random`,
            action: action,
            target: target,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

export { app, auth, db, storage, rtdb };
