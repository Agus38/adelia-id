
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
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Clean up previous Firestore listener if it exists
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
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

            set({
              user: {
                uid: authUser.uid,
                email: authUser.email,
                id: docSnap.id,
                role: userData.role,
                status: userData.status,
                avatarUrl: userData.avatarUrl || authUser.photoURL,
                fullName: userData.fullName || authUser.displayName,
              },
              loading: false,
            });
          } else {
             // Fallback for when the document might not exist yet or there's a permission issue initially
             // We still set a basic user object to prevent UI breakage
             set({
              user: {
                uid: authUser.uid,
                email: authUser.email,
                fullName: authUser.displayName,
                photoURL: authUser.photoURL,
              },
              loading: false,
            });
          }
        }, (error) => {
          console.error("Firestore listener error:", error.message);
          // CRITICAL FIX: DO NOT sign out the user here.
          // This prevents the logout loop if there's a temporary permission issue on first load.
          // Instead, fallback to the basic authUser data.
          set({
            user: {
              uid: authUser.uid,
              email: authUser.email,
              fullName: authUser.displayName,
              photoURL: authUser.photoURL,
            },
            loading: false,
          });
        });
      } else {
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
