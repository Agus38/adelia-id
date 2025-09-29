
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/app/main-layout';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  initializeUserListener: () => () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.status === 'Diblokir') {
              toast({
                title: "Akses Ditolak",
                description: "Akun Anda telah diblokir. Anda akan dikeluarkan.",
                variant: "destructive",
                duration: 5000,
              });
              await signOut(auth);
              set({ user: null, loading: false });
              return;
            }

            set({
              user: {
                ...authUser,
                id: docSnap.id,
                fullName: userData.fullName || authUser.displayName,
                role: userData.role || 'Pengguna',
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                status: userData.status || 'Aktif',
              },
              loading: false,
            });
          } else {
            // User exists in Auth but not in Firestore. Fallback to auth data.
             set({
              user: {
                ...authUser,
                id: authUser.uid,
                fullName: authUser.displayName,
                role: 'Pengguna',
                avatarUrl: authUser.photoURL,
                status: 'Aktif',
              },
              loading: false,
            });
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          // Fallback to authUser data if there's an error (e.g., transient permission issue)
          set({
            user: {
              ...authUser,
              id: authUser.uid,
              fullName: authUser.displayName,
              role: 'Pengguna',
              avatarUrl: authUser.photoURL,
              status: 'Aktif',
            },
            loading: false,
          });
        }
      } else {
        // No user is signed in.
        set({ user: null, loading: false });
      }
    });

    return authUnsubscribe;
  },
  clearUser: () => set({ user: null, loading: false }),
}));
