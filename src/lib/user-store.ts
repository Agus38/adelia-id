'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
        // Set up the real-time listener for the user's document
        const userDocRef = doc(db, 'users', authUser.uid);
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // If the user is blocked, sign them out immediately.
            if (userData.status === 'Diblokir') {
              signOut(auth).then(() => {
                  toast({
                      title: "Akses Ditolak",
                      description: "Akun Anda telah diblokir oleh administrator.",
                      variant: "destructive"
                  });
              });
              return; // Stop further processing
            }

            // Update the store with the full, real-time data from Firestore
            set({
              user: {
                uid: authUser.uid,
                email: authUser.email,
                id: docSnap.id,
                role: userData.role,
                status: userData.status,
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                fullName: userData.fullName || authUser.displayName,
              },
              loading: false,
            });
          } else {
             // If document doesn't exist after login, it's an error state.
             // This might happen if user is deleted from DB but not Auth.
             signOut(auth);
          }
        }, (error) => {
          // This error handler is crucial. It catches permission errors.
          console.error("Firestore listener error:", error.message);
          signOut(auth); // If we can't read the user's document, we can't verify their role/status.
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
