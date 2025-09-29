
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
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
    // This listener only reacts to Firebase Auth state changes.
    // It does NOT interact with Firestore, thus avoiding all permission errors on login.
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // If a user is authenticated, we populate the store with the data
        // ALREADY AVAILABLE in the auth object. No Firestore read is needed here.
        const profile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email,
          id: authUser.uid,
          fullName: authUser.displayName,
          avatarUrl: authUser.photoURL,
          // Role and Status will be checked and handled by page-level logic (e.g., login page, admin layout)
          // which is more reliable than trying to get it here during the auth state change.
          role: 'Pengguna', // Assume 'Pengguna' by default. Admin validation happens elsewhere.
          status: 'Aktif',
        };
        set({ user: profile, loading: false });
      } else {
        // No authenticated user, clear the state.
        set({ user: null, loading: false });
      }
    });

    return () => {
      authUnsubscribe();
    };
  },
  clearUser: () => set({ user: null, loading: false }),
}));
