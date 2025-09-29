
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
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

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // Initially set user data from auth object. This is fast and reliable.
        const basicUserProfile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email,
          fullName: authUser.displayName,
          photoURL: authUser.photoURL,
          // Initialize other fields as undefined or default
          role: undefined, 
          status: 'Aktif', 
        };
        set({ user: basicUserProfile, loading: false });

        // Now, set up a real-time listener for the user's document.
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

            // Merge Firestore data with existing auth data
            set(state => ({
              user: {
                ...state.user, // Keep basic data
                uid: authUser.uid, // Ensure uid is from authUser
                email: authUser.email,
                id: docSnap.id,
                role: userData.role,
                status: userData.status,
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                fullName: userData.fullName || authUser.displayName,
              },
              loading: false,
            }));
          } else {
             // Document doesn't exist, but user is authenticated. 
             // This might happen on first registration before doc is created.
             // We'll rely on the basic profile.
             console.warn(`User document for UID ${authUser.uid} not found. Sticking with basic auth data.`);
             set({ user: basicUserProfile, loading: false });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // Fallback to basic data if listener fails for any reason
          set({ user: basicUserProfile, loading: false });
        });

      } else {
        // User is logged out
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
