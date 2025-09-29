
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
        const userDocRef = doc(db, 'users', authUser.uid);

        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.status === 'Diblokir') {
              // Sign out if user becomes blocked during an active session
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
              role: userData.role,
              status: userData.status,
              avatarUrl: userData.avatarUrl || authUser.photoURL,
              fullName: userData.fullName || authUser.displayName,
            };
            set({ user: fullUserProfile, loading: false });

          } else {
            // This case might happen if the user's Firestore document is deleted
            // while they are still authenticated.
            signOut(auth);
            set({ user: null, loading: false });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // Fallback to basic data but don't sign out.
          // This prevents logout loops due to temporary permission issues.
          const basicProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              id: authUser.uid,
              role: 'Pengguna', // Assume basic role on error
              status: 'Aktif',
              avatarUrl: authUser.photoURL,
              fullName: authUser.displayName,
          }
          set({ user: basicProfile, loading: false });
        });

      } else {
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
