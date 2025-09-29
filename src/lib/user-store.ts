
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

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
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
            // User exists in Auth but not in Firestore. This is an invalid state.
            signOut(auth);
            set({ user: null, loading: false });
            toast({
              title: "Login Gagal",
              description: "Data profil Anda tidak ditemukan. Silakan hubungi administrator.",
              variant: "destructive",
            });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // Fallback to basic auth data if listener fails, but DON'T sign out.
          // The error is likely temporary or due to rules, signing out causes a loop.
          const basicProfile: UserProfile = {
            uid: authUser.uid,
            email: authUser.email,
            id: authUser.uid,
            fullName: authUser.displayName,
            avatarUrl: authUser.photoURL,
            role: 'Pengguna', // Assume basic role
            status: 'Aktif',
          };
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
