
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuConfig } from '@/lib/menu-store';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/app/main-layout';

export function usePageAccess(pageId: string) {
  const router = useRouter();
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...authUser, ...userDoc.data() } as UserProfile);
        } else {
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoadingMenu || isLoadingUser) {
      return;
    }

    const menuItem = menuItems.find(item => item.id === pageId);

    if (!menuItem) {
      // If menu item doesn't exist, maybe it's a page not in the menu, default to accessible
      setHasAccess(true);
      return;
    }
    
    // First, check for authentication requirement.
    if (menuItem.requiresAuth && !user) {
        router.push('/login');
        setHasAccess(false);
        return;
    }

    // Then, check for role-based access.
    if (menuItem.access === 'admin' && user?.role !== 'Admin') {
      router.push('/unauthorized');
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }
  }, [isLoadingMenu, isLoadingUser, menuItems, user, pageId, router]);

  return {
    hasAccess,
    isLoading: isLoadingMenu || isLoadingUser
  };
}
