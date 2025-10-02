
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuConfig } from '@/lib/menu-store';
import { useUserStore } from '@/lib/user-store';

export function usePageAccess(pageId: string) {
  const router = useRouter();
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const { user, userGroups, loading: isLoadingUser } = useUserStore();
  const [hasAccess, setHasAccess] = useState(false);

  const isLoading = isLoadingMenu || isLoadingUser;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const menuItem = menuItems.find(item => item.id === pageId);
    
    // Default to accessible if page isn't in menu config (e.g. /profile, /settings)
    if (!menuItem) {
      // Still need to check for login on these specific pages
      if ((pageId === 'profile' || pageId === 'settings') && !user) {
         router.push('/login');
         setHasAccess(false);
      } else {
         setHasAccess(true);
      }
      return;
    }

    // 1. Admin always has access
    if (user?.role === 'Admin') {
      setHasAccess(true);
      return;
    }
    
    // 2. Check for maintenance mode (takes precedence over other checks for non-admins)
    if (menuItem.isUnderMaintenance) {
        router.push('/maintenance');
        setHasAccess(false);
        return;
    }

    // 3. For non-admins, check if logged in
    if (!user) {
      // If the page requires auth or is managed by groups, redirect to login
      if (menuItem.requiresAuth || menuItem.access === 'all') { // Check 'all' as it might be group controlled
         router.push('/login?redirect=' + pageId);
         setHasAccess(false);
         return;
      }
    }

    // 4. For logged-in non-admins, check group-based access
    if (user && user.role !== 'Admin') {
        const userGroupIds = userGroups.filter(g => g.memberIds.includes(user.id)).map(g => g.id);
        
        let isAllowedByGroup = false;
        // If a menu is available to 'all', it's accessible unless restricted by groups.
        // For simplicity, let's assume if any group gives access, it's a yes.
        for (const groupId of userGroupIds) {
            const group = userGroups.find(g => g.id === groupId);
            if (group && group.menuAccess && group.menuAccess[pageId]) {
                isAllowedByGroup = true;
                break;
            }
        }
        
        if (!isAllowedByGroup) {
            router.push('/unauthorized');
            setHasAccess(false);
            return;
        }
    }

    // 5. If all checks pass
    setHasAccess(true);

  }, [isLoading, menuItems, user, userGroups, pageId, router]);

  return {
    hasAccess,
    isLoading
  };
}
