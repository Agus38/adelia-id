
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
    
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Unsubscribe from any previous Firestore listeners
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      
      firestoreUnsubscribe = null;

      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.status === 'Diblokir') {
              toast({
                title: 'Akses Diblokir',
                description: 'Akun Anda telah diblokir oleh administrator. Anda akan dikeluarkan secara otomatis.',
                variant: 'destructive',
                duration: 5000,
              });
              signOut(auth);
              return; 
            }

            const fullUserProfile: UserProfile = {
              id: userDoc.id,
              uid: authUser.uid,
              ...userData,
            };
            set({ user: fullUserProfile, loading: false });
          } else {
            const basicProfile: UserProfile = {
                uid: authUser.uid, email: authUser.email, id: authUser.uid,
                fullName: authUser.displayName, avatarUrl: authUser.photoURL, role: undefined,
            };
            set({ user: basicProfile, loading: false });
          }
        }, (error) => {
           console.error("Error with onSnapshot for user:", error);
           set({ loading: false });
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
