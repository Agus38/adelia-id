
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
    if (!user) return; // Don't log if user is not authenticated

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
        
        // Use a one-time getDoc to check for existence and handle creation if needed.
        // This is crucial for the first login after registration.
        try {
            const initialDoc = await getDoc(userDocRef);

            if (!initialDoc.exists()) {
                // User is authenticated but has no document. This is the first login.
                // Create the user document now.
                const newUserProfile = {
                    uid: authUser.uid,
                    email: authUser.email,
                    fullName: authUser.displayName,
                    role: 'Pengguna', // Default role
                    status: 'Aktif', // Default status
                    avatarUrl: authUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.displayName || 'A')}&background=random`,
                    createdAt: serverTimestamp(),
                };
                await setDoc(userDocRef, newUserProfile);
                 await logActivity('mendaftar', 'Sistem');
            }
        } catch (error) {
             console.error("Error ensuring user document exists:", error);
             signOut(auth); // Sign out if we can't even check/create the doc.
             set({ user: null, loading: false });
             return;
        }

        // Now that we're sure the document exists, set up the real-time listener.
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
            // This case should no longer be reached due to the initial check, but as a safeguard:
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
