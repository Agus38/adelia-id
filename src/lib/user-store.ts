
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
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // When auth state changes, fetch the full profile from Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const fullUserProfile = {
            id: userDoc.id,
            uid: authUser.uid,
            ...userDoc.data(),
          } as UserProfile;
          set({ user: fullUserProfile, loading: false });
        } else {
           // Fallback to basic auth info if Firestore doc doesn't exist
           const basicProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              id: authUser.uid,
              fullName: authUser.displayName,
              avatarUrl: authUser.photoURL,
          };
          set({ user: basicProfile, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });

    return unsubscribe;
  },
  setUserProfile: (profile) => {
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
