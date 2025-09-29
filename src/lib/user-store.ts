
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '@/app/main-layout';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  initializeUserListener: () => () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Immediately set basic user data from auth object to avoid UI flicker
        set({
          user: {
            ...get().user, // preserve existing data if any
            ...authUser,
            id: authUser.uid,
            fullName: authUser.displayName,
            role: 'Pengguna', // Default role
            avatarUrl: authUser.photoURL,
            status: 'Aktif',
          },
          loading: false, // Set loading to false once we have authUser
        });

        // Set up a real-time listener for the user's document for live updates (like status changes)
        const userDocRef = doc(db, 'users', authUser.uid);
        const docUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            if (userData.status === 'Diblokir') {
                toast({
                  title: "Akses Ditolak",
                  description: "Akun Anda telah diblokir. Anda akan dikeluarkan.",
                  variant: "destructive",
                  duration: 5000,
                });
                signOut(auth);
                return; // Stop further processing
            }

            // Update the store with the full data from Firestore
            set(state => ({
              user: {
                ...state.user, // Keep the base auth data
                ...authUser,
                id: docSnap.id,
                fullName: userData.fullName || authUser.displayName,
                role: userData.role || 'Pengguna',
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                status: userData.status || 'Aktif',
              } as UserProfile
            }));
          }
        }, (error) => {
          // This error can happen for a regular user if rules are too strict.
          // We don't want to log them out. The basic info from authUser is enough.
          console.warn(`Could not listen to user document for ${authUser.uid}. This might be expected for non-admin users.`, error.message);
        });

        // Return the unsubscribe function for the document listener
        return docUnsubscribe;

      } else {
        // No user is signed in.
        set({ user: null, loading: false });
      }
    });

    return authUnsubscribe;
  },
  clearUser: () => set({ user: null, loading: false }),
}));
