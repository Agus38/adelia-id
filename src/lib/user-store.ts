
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

// Keep a global reference to the Firestore listener to avoid multiple listeners.
let firestoreUnsubscribe: (() => void) | null = null;

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // If a user logs out, clean up existing Firestore listener.
      if (!authUser && firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // If there's already a listener for a different user, unsubscribe first.
        if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
          firestoreUnsubscribe = null;
        }

        const userDocRef = doc(db, 'users', authUser.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            // CRITICAL: Real-time check for blocked status.
            if (userData.status === 'Diblokir') {
              toast({
                title: "Akses Ditolak",
                description: "Akun Anda telah diblokir. Anda akan dikeluarkan.",
                variant: "destructive",
                duration: 5000,
              });
              signOut(auth);
              // State will be cleared by the auth listener when signOut completes.
              return;
            }

            set({
              user: {
                ...authUser,
                id: docSnap.id,
                fullName: userData.fullName || authUser.displayName,
                role: userData.role,
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                status: userData.status || 'Aktif',
              },
              loading: false,
            });
          } else {
            // User exists in Auth but not in Firestore. This can happen during registration
            // or if the document was deleted manually. Treat as a non-privileged user.
            // Use displayName from auth as the primary source for fullName here.
            set({ 
              user: { 
                ...authUser, 
                fullName: authUser.displayName, 
                role: 'Pengguna',
                status: 'Aktif', // Assume active if no doc exists
              },
              loading: false 
            });
          }
        }, (error) => {
            console.error("Firestore error listening to user document:", error);
            // This can happen if a regular user doesn't have permission to read their own doc.
            // Treat them as a standard user using data from the auth object.
             set({
              user: {
                ...authUser,
                fullName: authUser.displayName, // Use displayName from auth object
                role: 'Pengguna', // Fallback to a non-privileged role
                status: 'Aktif',
              },
              loading: false,
            });
        });
      } else {
        // No user is signed in, clear user data and ensure loading is false.
        set({ user: null, loading: false });
      }
    });

    // The returned function is the cleanup function for useEffect.
    // It will unsubscribe from the auth state listener when the app unmounts.
    return authUnsubscribe; 
  },
  clearUser: () => set({ user: null, loading: false }),
}));
