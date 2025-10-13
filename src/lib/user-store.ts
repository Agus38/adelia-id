
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import type { UserProfile } from '@/app/main-layout';
import { doc, getDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

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
    let firestoreUnsubscribe: (() => void) | null = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Unsubscribe from any previous Firestore listeners
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      
      firestoreUnsubscribe = null;

      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        // We use getDoc here initially to quickly decide if a user is an admin
        // This helps solve race conditions with email verification
        const initialUserDoc = await getDoc(userDocRef);

        // Immediately handle unverified users who are not admins
        if (!authUser.emailVerified && initialUserDoc.exists() && initialUserDoc.data().role !== 'Admin') {
          // Don't sign out here, as the login page logic handles it.
          // Just ensure the app state treats them as logged out.
          set({ user: null, loading: false });
          return;
        }

        firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.status === 'Diblokir') {
              signOut(auth).then(() => {
                toast({
                  title: 'Akses Diblokir',
                  description: 'Akun Anda telah diblokir oleh administrator. Anda akan dikeluarkan secara otomatis.',
                  variant: 'destructive',
                  duration: 5000,
                });
              });
              // State is cleared by the onAuthStateChanged listener recursively
              return; 
            }

            const fullUserProfile: UserProfile = {
              id: userDoc.id,
              uid: authUser.uid,
              ...userData,
            };
            set({ user: fullUserProfile, loading: false });
          } else {
            // User exists in Auth but not Firestore. This is an invalid state.
            // Log them out.
            signOut(auth);
            set({ user: null, loading: false });
          }
        }, (error) => {
           console.error("Error with onSnapshot for user:", error);
           set({ loading: false });
           signOut(auth); // Sign out on error to be safe
        });

      } else {
        // No authenticated user
        set({ user: null, loading: false });
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  },
  setUserProfile: (profile) => {
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
