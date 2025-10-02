
'use client';

import { useState, useEffect, useMemo } from 'react';
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
    
    // Default to accessible if page isn't in menu config (e.g. /profile)
    if (!menuItem) {
      // Still need to check for login on pages not in menu but require auth
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
    
    // 2. Check for maintenance mode (takes precedence)
    if (menuItem.isUnderMaintenance) {
        router.push('/maintenance');
        setHasAccess(false);
        return;
    }

    // 3. Check for auth requirement
    if (menuItem.requiresAuth && !user) {
        router.push('/login');
        setHasAccess(false);
        return;
    }
    
    // 4. Check group-based access for non-admins
    if (user && user.role !== 'Admin') {
        const userGroupIds = userGroups.filter(g => g.memberIds.includes(user.id)).map(g => g.id);
        
        let isAllowedByGroup = false;
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
