
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from './firebase';
import type { UserProfile } from '@/app/main-layout';
import { doc, getDoc, onSnapshot, collection, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface UserGroup {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    menuAccess: Record<string, boolean>;
    createdAt?: any;
}

interface UserState {
  user: UserProfile | null;
  userGroups: UserGroup[];
  loading: boolean;
  initializeUserListener: () => () => void;
  setUserProfile: (profile: UserProfile) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userGroups: [],
  loading: true,
  initializeUserListener: () => {
    let firestoreUnsubscribe: (() => void) | null = null;
    let groupsUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Unsubscribe from any previous Firestore listeners
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      if (groupsUnsubscribe) groupsUnsubscribe();
      
      firestoreUnsubscribe = null;
      groupsUnsubscribe = null;

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
        
        // Also listen to user groups
        const groupsQuery = query(collection(db, 'userGroups'));
        groupsUnsubscribe = onSnapshot(groupsQuery, (snapshot) => {
            const groupsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserGroup));
            set({ userGroups: groupsList });
        }, (error) => {
            console.error("Error fetching user groups:", error);
        });

      } else {
        // No authenticated user
        set({ user: null, userGroups: [], loading: false });
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      if (groupsUnsubscribe) groupsUnsubscribe();
    };
  },
  setUserProfile: (profile) => {
    set({ user: profile, loading: false });
  },
  clearUser: () => set({ user: null, loading: false }),
}));
