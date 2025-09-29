
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
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Just set the basic auth user, the full profile will be set on login page
         const basicProfile: UserProfile = {
            uid: authUser.uid,
            email: authUser.email,
            id: authUser.uid,
            fullName: authUser.displayName,
            avatarUrl: authUser.photoURL,
        };
        // Avoid overwriting a full profile with a basic one if it's already there
        if (!get().user || get().user?.uid !== authUser.uid) {
             set({ user: basicProfile, loading: false });
        } else {
             set({ loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });

    return () => {
      authUnsubscribe();
    };
  },
  setUserProfile: (profile) => {
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
