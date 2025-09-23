
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
        // If there's already a listener, don't create a new one.
        if (firestoreUnsubscribe) return; 

        const userDocRef = doc(db, 'users', authUser.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.status === 'Diblokir') {
              toast({
                title: "Akses Ditolak",
                description: "Akun Anda telah diblokir. Anda akan dikeluarkan.",
                variant: "destructive",
                duration: 5000,
              });
              signOut(auth);
              // State will be cleared by the auth listener below.
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
            // User in Auth but not Firestore (e.g., during registration)
            set({ user: authUser, loading: false });
          }
        }, (error) => {
            console.error("Error fetching user document:", error);
            // Fallback to auth user data if Firestore fails
            set({ user: authUser, loading: false }); 
        });
      } else {
        // No user is signed in, clear user data.
        set({ user: null, loading: false });
      }
    });

    // The returned function is the cleanup function for useEffect.
    // It will unsubscribe from the auth state listener when the app unmounts.
    return authUnsubscribe; 
  },
  clearUser: () => set({ user: null, loading: false }),
}));
