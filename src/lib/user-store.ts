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

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Attempt to fetch the full user profile from Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const fullUserProfile: UserProfile = {
              id: userDoc.id,
              uid: authUser.uid,
              ...userDoc.data(),
            };
            set({ user: fullUserProfile, loading: false });
          } else {
             // Fallback to basic auth info if Firestore doc doesn't exist
            const basicProfile: UserProfile = {
                uid: authUser.uid,
                email: authUser.email,
                id: authUser.uid,
                fullName: authUser.displayName,
                avatarUrl: authUser.photoURL,
                role: undefined, // Explicitly set role as undefined
            };
            set({ user: basicProfile, loading: false });
          }
        } catch (error) {
           console.error("Error fetching user profile:", error);
           const basicProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              id: authUser.uid,
              fullName: authUser.displayName,
              avatarUrl: authUser.photoURL,
              role: undefined,
           };
           set({ user: basicProfile, loading: false });
        }
      } else {
        // No authenticated user
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
  setUserProfile: (profile) => {
    // This is still useful for immediate updates after login
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
