
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
            set({ 
              user: { ...authUser, role: 'Pengguna' }, // Assign default role
              loading: false 
            });
          }
        }, (error) => {
            console.error("Firestore error listening to user document:", error);
            // This is a critical error, likely due to permissions.
            // DO NOT sign the user out. Instead, treat them as a standard user.
            // This allows the app to function for non-admin roles even if admin-only data fails to load.
             set({
              user: {
                ...authUser,
                role: 'Pengguna', // Fallback to a non-privileged role
              },
              loading: false,
            });
            toast({
              title: "Gagal Memuat Peran",
              description: "Tidak dapat memverifikasi peran Anda, beberapa fitur mungkin tidak tersedia.",
              variant: "destructive",
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
