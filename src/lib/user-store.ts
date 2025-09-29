
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/app/main-layout';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  initializeUserListener: () => () => void;
  clearUser: () => void;
}

let firestoreUnsubscribe: (() => void) | null = null;

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Clean up previous Firestore listener if it exists
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // Set a basic user object immediately to stop the main loading state.
        // This uses the data available directly from the auth object.
        const basicUser: UserProfile = {
          uid: authUser.uid,
          email: authUser.email,
          fullName: authUser.displayName,
          avatarUrl: authUser.photoURL,
          // Role and status are unknown at this point, so they are not set here
        };
        
        // Avoid flicker by setting loading to false now with basic data
        if (get().loading) {
            set({ user: basicUser, loading: false });
        }

        // Now, set up the real-time listener for the user's document
        const userDocRef = doc(db, 'users', authUser.uid);
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // If the user is blocked, sign them out immediately.
            if (userData.status === 'Diblokir') {
              signOut(auth);
              return; // Stop further processing
            }

            // Update the store with the full, real-time data from Firestore
            set({
              user: {
                ...basicUser, // Keep the base data
                id: docSnap.id,
                role: userData.role,
                status: userData.status,
                // Prefer Firestore avatarUrl if it exists, otherwise use auth photoURL
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                fullName: userData.fullName || authUser.displayName, // Prefer Firestore name
              },
              loading: false, // Ensure loading is false
            });
          } else {
            // Document doesn't exist, which could be a temporary issue or a real problem.
            // For now, we just stick with the basic auth user and don't sign them out here.
            // The login page is now responsible for handling this case on initial login.
            set({ user: basicUser, loading: false });
          }
        }, (error) => {
          // This error handler is crucial. It catches permission errors.
          // Instead of signing out, we just log the error and stick with the basic user data.
          console.error("Firestore listener error (this is often a temporary permission issue on first load, and can be ignored if the app functions correctly):", error.message);
          set({ user: basicUser, loading: false }); // Ensure app is usable with basic data
        });

      } else {
        // No user is signed in. Clear everything.
        set({ user: null, loading: false });
      }
    });

    // Return the function to unsubscribe from the auth listener
    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  },
  clearUser: () => set({ user: null, loading: false }),
}));
