
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import type { UserProfile } from '@/app/main-layout';
import { doc, getDoc } from 'firebase/firestore';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  initializeUserListener: () => () => void;
  setUserProfile: (profile: UserProfile) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    // This listener now ONLY handles Firebase Auth state, not Firestore.
    // This prevents the race condition causing permission errors.
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Just set the basic user profile from auth, no firestore call here.
        // The full profile will be fetched and set upon login.
        const basicProfile: UserProfile = {
            uid: authUser.uid,
            email: authUser.email,
            id: authUser.uid,
            fullName: authUser.displayName,
            avatarUrl: authUser.photoURL,
        };
        // Check if the store already has a full user profile to avoid overwriting it
        if (!get().user || get().user?.uid !== authUser.uid) {
            set({ user: basicProfile, loading: false });
        } else {
            // If a full profile is already there, just update loading state
            set({ loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });

    return unsubscribe;
  },
  setUserProfile: (profile) => {
    // This function allows the login page to explicitly set the full profile.
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
