
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuConfig } from '@/lib/menu-store';
import { useUserStore } from '@/lib/user-store';

export function usePageAccess(pageId: string) {
  const router = useRouter();
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const { user, loading: isLoadingUser } = useUserStore();
  const [hasAccess, setHasAccess] = useState(false);

  const isLoading = isLoadingMenu || isLoadingUser;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const menuItem = menuItems.find(item => item.id === pageId);
    
    // Default to accessible if page isn't in menu config (e.g., /profile, /settings, /)
    if (!menuItem) {
      setHasAccess(true);
      return;
    }

    // 1. Check for maintenance mode (for non-admins)
    if (menuItem.isUnderMaintenance && user?.role !== 'Admin') {
        router.push('/maintenance');
        setHasAccess(false);
        return;
    }
    
    // 2. Check for pages that require authentication but user is not logged in
    if (menuItem.requiresAuth && !user) {
      router.push('/login?redirect=' + pageId);
      setHasAccess(false);
      return;
    }

    // 3. Check for role-based access
    if (menuItem.access && menuItem.access !== 'all') {
      if (!user) { // Should be caught by requiresAuth, but as a safeguard
        router.push('/login?redirect=' + pageId);
        setHasAccess(false);
        return;
      }
      // Admins have access to everything
      if (user.role === 'Admin') {
        setHasAccess(true);
        return;
      }
      // Check if user's role matches the required role
      if (user.role?.toLowerCase() !== menuItem.access.toLowerCase()) {
         router.push('/unauthorized');
         setHasAccess(false);
         return;
      }
    }


    // If none of the above conditions are met, grant access.
    setHasAccess(true);

  }, [isLoading, menuItems, user, pageId, router]);

  return {
    hasAccess,
    isLoading
  };
}
