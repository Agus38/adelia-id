
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
    // This listener handles auth state changes and sets up the Firestore listener.
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Always clean up the previous Firestore listener
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (authUser) {
        // Set loading to true while we fetch Firestore data
        set({ loading: true });

        const userDocRef = doc(db, 'users', authUser.uid);
        
        // This is the real-time listener for the user's own document.
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();

            // REAL-TIME BLOCKING: If user status changes to 'Diblokir' while they are logged in.
            if (userData.status === 'Diblokir') {
              signOut(auth).then(() => {
                toast({
                  title: "Akses Ditolak",
                  description: "Akun Anda telah diblokir oleh administrator.",
                  variant: "destructive"
                });
              });
              // The signOut will trigger onAuthStateChanged again, which will clear the user state.
              return;
            }

            // Merge auth data with Firestore data for a complete profile.
            const fullUserProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email,
              id: docSnap.id,
              role: userData.role,
              status: userData.status,
              avatarUrl: userData.avatarUrl || authUser.photoURL,
              fullName: userData.fullName || authUser.displayName,
            };
            set({ user: fullUserProfile, loading: false });

          } else {
             // Document doesn't exist, sign out the user as it's an invalid state.
            signOut(auth).then(() => {
                console.error(`User document for UID ${authUser.uid} not found. User has been signed out.`);
                toast({
                    title: "Kesalahan Akun",
                    description: "Data profil Anda tidak ditemukan. Silakan hubungi administrator.",
                    variant: "destructive",
                });
            });
          }
        }, (error) => {
          // This error block handles when the listener itself fails (e.g., due to permissions).
          console.error("Firestore listener error:", error.message);
          // CRITICAL: Do NOT sign out here. Instead, sign out and show an error on the login page.
          // For an active session, this could mean temporary network issues. We don't want to log out.
          // Fallback to basic user data if the listener fails to prevent a crash.
          set(state => ({
            user: state.user ? { ...state.user, role: state.user.role || 'Pengguna' } : null,
            loading: false
          }));
        });

      } else {
        // User is logged out, clear everything.
        set({ user: null, loading: false });
      }
    });

    // Return the cleanup function for both listeners.
    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  },
  clearUser: () => set({ user: null, loading: false }),
}));
