
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
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // Set basic user data immediately from auth object
        const basicProfile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email,
          id: authUser.uid, // Use uid as a fallback id
          // These will be updated by the listener if available
          role: 'Pengguna', 
          status: 'Aktif',
          avatarUrl: authUser.photoURL,
          fullName: authUser.displayName,
        };
        set({ user: basicProfile, loading: false });

        // Now, set up the real-time listener for the user's document
        const userDocRef = doc(db, 'users', authUser.uid);
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.status === 'Diblokir') {
              signOut(auth).then(() => {
                toast({
                  title: "Akses Ditolak",
                  description: "Akun Anda telah diblokir oleh administrator.",
                  variant: "destructive"
                });
              });
              return;
            }

            const fullUserProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              id: docSnap.id,
              role: userData.role || 'Pengguna',
              status: userData.status || 'Aktif',
              avatarUrl: userData.avatarUrl || authUser.photoURL,
              fullName: userData.fullName || authUser.displayName,
            };
            set({ user: fullUserProfile, loading: false });

          } else {
            // Document might not exist yet, or was deleted. Fallback to basic auth data.
            // The login page is responsible for blocking users whose document doesn't exist.
            set({ user: basicProfile, loading: false });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // CRITICAL FIX: DO NOT sign out the user here.
          // This prevents the logout loop if there's a temporary permission issue on first load.
          // Instead, fallback to the basic authUser data.
          set({ user: basicProfile, loading: false });
        });
      } else {
        // No authenticated user
        set({ user: null, loading: false });
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  },
  clearUser: () => set({ user: null, loading: false }),
}));
