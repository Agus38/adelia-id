'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import type { UserProfile } from '@/app/main-layout';
import { doc, getDoc, onSnapshot, collection, query, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  initializeUserListener: () => () => void;
  setUserProfile: (profile: UserProfile) => void;
  clearUser: () => void;
}

// --- Activity Logging (Moved here to be client-side only) ---
export const logActivity = async (action: string, target: string) => {
    const user = auth.currentUser;
    // Do not log if user is not authenticated or if the action is just logging in
    if (!user || action === 'login') return; 

    try {
        await addDoc(collection(db, 'activityLogs'), {
            userId: user.uid,
            userName: user.displayName || user.email,
            userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'A')}&background=random`,
            action: action,
            target: target,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};


export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  initializeUserListener: () => {
    let firestoreUnsubscribe: (() => void) | null = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Unsubscribe from any previous Firestore listeners
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      
      firestoreUnsubscribe = null;
      const wasUser = !!get().user; // Check if there was a user before this state change

      if (authUser) {
        // If the user's email is not verified, and they are not an admin, don't let them proceed.
        // This is a crucial security check.
        const userDocForRole = await getDoc(doc(db, 'users', authUser.uid));
        const role = userDocForRole.data()?.role;

        if (!authUser.emailVerified && role !== 'Admin') {
            // Don't set the user in the store, effectively keeping them logged out from the app's perspective.
            // But don't sign out from Firebase yet, to allow them to be on the login page
            // where they can see the "resend verification" option.
            set({ user: null, loading: false });
            return;
        }

        const userDocRef = doc(db, 'users', authUser.uid);
        
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
              return; 
            }

            const fullUserProfile: UserProfile = {
              id: userDoc.id,
              uid: authUser.uid,
              ...userData,
            };
            set({ user: fullUserProfile, loading: false });
            
            const loginToastShown = sessionStorage.getItem('loginToastShown');
            if (!loginToastShown) {
                toast({
                    title: `Selamat Datang Kembali, ${userData.fullName || 'Pengguna'}!`,
                    description: 'Anda berhasil masuk ke akun Anda.',
                });
                sessionStorage.setItem('loginToastShown', 'true');
                logActivity('login', 'Aplikasi');
            }
          } else {
            signOut(auth);
            set({ user: null, loading: false });
          }
        }, (error) => {
           console.error("Error with onSnapshot for user:", error);
           signOut(auth);
           set({ user: null, loading: false });
        });

      } else {
        if (wasUser) {
            toast({
                title: `Anda Telah Keluar`,
                description: 'Sesi Anda telah berhasil diakhiri.',
                variant: "destructive",
            });
        }
        sessionStorage.removeItem('loginToastShown');
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
  clearUser: () => {
    sessionStorage.removeItem('loginToastShown');
    set({ user: null, loading: false });
  },
}));
    