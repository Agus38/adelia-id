
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
    
    // First, check for maintenance mode. This takes precedence over all other checks.
    if (menuItem.isUnderMaintenance) {
        router.push('/maintenance');
        setHasAccess(false);
        return;
    }

    // Then, check for authentication requirement.
    if (menuItem.requiresAuth && !user) {
        router.push('/login');
        setHasAccess(false);
        return;
    }

    // Finally, check for role-based access.
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
