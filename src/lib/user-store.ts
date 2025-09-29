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
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // Set basic user info immediately to avoid UI flickering
        set({
          user: {
            ...authUser,
            id: authUser.uid,
            fullName: authUser.displayName,
            avatarUrl: authUser.photoURL,
          },
          loading: true,
        });

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
              ...get().user, // Keep basic data
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
            console.error(`User document for UID ${authUser.uid} not found. The user might not have a profile record.`);
            // Fallback to authUser data if Firestore doc doesn't exist
            set({ user: { ...get().user, role: 'Pengguna', status: 'Aktif' }, loading: false });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // CRITICAL FIX: DO NOT sign out the user here.
          // This prevents the logout loop if there's a temporary permission issue on first load.
          // Instead, fallback to the basic authUser data.
          set({
            user: { ...get().user, role: 'Pengguna', status: 'Aktif' },
            loading: false
          });
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
