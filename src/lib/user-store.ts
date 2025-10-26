
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
  loginToastShown: boolean; // Flag to track if the login toast has been shown
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
  loginToastShown: false,
  initializeUserListener: () => {
    let firestoreUnsubscribe: (() => void) | null = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      // Unsubscribe from any previous Firestore listeners
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      
      firestoreUnsubscribe = null;
      const wasUser = !!get().user; // Check if there was a user before this state change

      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        // This listener syncs user data in real-time.
        // Document creation is now handled at registration.
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
            
            // Show welcome toast only on initial login, not on every data refresh
            if (!get().loginToastShown) {
                toast({
                    title: `Selamat Datang Kembali, ${userData.fullName || 'Pengguna'}!`,
                    description: 'Anda berhasil masuk ke akun Anda.',
                });
                set({ loginToastShown: true });
                logActivity('login', 'Aplikasi');
            }
          } else {
            // This case should be rare now, but as a fallback, sign out.
            signOut(auth);
            set({ user: null, loading: false });
          }
        }, (error) => {
           console.error("Error with onSnapshot for user:", error);
           signOut(auth);
           set({ user: null, loading: false });
        });

      } else {
        // No authenticated user
        if (wasUser) { // If there was a user before, it means they just logged out
            toast({
                title: `Anda Telah Keluar`,
                description: 'Sesi Anda telah berhasil diakhiri.',
                variant: "destructive",
            });
        }
        set({ user: null, loading: false, loginToastShown: false }); // Reset toast flag on logout
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
  clearUser: () => set({ user: null, loading: false, loginToastShown: false }),
}));
