
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

// This will hold the unsubscribe function for the Firestore listener
let firestoreUnsubscribe: (() => void) | null = null;

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    // This is the main listener for authentication state changes
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // First, clean up any existing Firestore listener to prevent duplicates
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // User is logged in. Set up a real-time listener for their document.
        const userDocRef = doc(db, 'users', authUser.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Check for blocked status in real-time
            if (userData.status === 'Diblokir') {
              toast({
                title: "Akses Ditolak",
                description: "Akun Anda telah diblokir. Anda akan dikeluarkan.",
                variant: "destructive",
                duration: 5000,
              });
              signOut(auth); // This will trigger the onAuthStateChanged listener again, cleaning up the state.
              return;
            }

            // Update the store with the full, real-time data from Firestore
            set({
              user: {
                // Base data from auth object
                uid: authUser.uid,
                email: authUser.email,
                // Overwrite with more accurate data from Firestore
                id: docSnap.id,
                fullName: userData.fullName || authUser.displayName,
                role: userData.role || 'Pengguna',
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                status: userData.status || 'Aktif',
              } as UserProfile,
              loading: false, // We have the full user data, so loading is complete
            });
          } else {
            // Document doesn't exist, which is an invalid state for a logged-in user.
            // Log them out.
             toast({
                title: "Error Verifikasi",
                description: "Data profil Anda tidak ditemukan. Silakan hubungi admin.",
                variant: "destructive",
              });
             signOut(auth);
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
           // Fallback to basic auth data if Firestore listener fails, but don't sign out.
           set({
            user: {
              uid: authUser.uid,
              email: authUser.email,
              fullName: authUser.displayName,
            } as UserProfile,
            loading: false
          });
        });
      } else {
        // No user is signed in. Clear the user state.
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
