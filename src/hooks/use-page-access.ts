
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

    // 1. Admin always has access
    if (user?.role === 'Admin') {
      setHasAccess(true);
      return;
    }
    
    // Default to accessible if page isn't in menu config (e.g., /profile, /settings, /)
    if (!menuItem) {
      setHasAccess(true);
      return;
    }
    
    // 2. Check for maintenance mode (takes precedence for non-admins)
    if (menuItem.isUnderMaintenance) {
        router.push('/maintenance');
        setHasAccess(false);
        return;
    }

    // 3. Handle pages that require authentication
    if (menuItem.requiresAuth) {
        if (!user) {
            router.push('/login?redirect=' + pageId);
            setHasAccess(false);
            return;
        }

        // User is logged in, now check group permissions
        const userGroupIds = userGroups.filter(g => g.memberIds.includes(user.id)).map(g => g.id);
        
        let isAllowedByGroup = false;
        if (userGroupIds.length > 0) {
          for (const groupId of userGroupIds) {
              const group = userGroups.find(g => g.id === groupId);
              if (group && group.menuAccess && group.menuAccess[pageId]) {
                  isAllowedByGroup = true;
                  break;
              }
          }
        }
        
        // This handles cases where a menu is for all logged-in users, 
        // but might be explicitly disabled for some groups.
        // For simplicity, if it requires auth and isn't explicitly granted by a group, we deny.
        // A better approach might be to check if ANY group manages this menu item.
        // Let's refine: if any group has a setting for this menu, access MUST be granted by a group.
        const isMenuGroupManaged = userGroups.some(g => g.menuAccess && g.menuAccess[pageId] !== undefined);

        if (isMenuGroupManaged && !isAllowedByGroup) {
            router.push('/unauthorized');
            setHasAccess(false);
            return;
        }
        
        // If the menu requires auth, but is not managed by any group, we can assume it's for all logged-in users.
        if (!isMenuGroupManaged) {
            setHasAccess(true);
            return;
        }

        if (isAllowedByGroup) {
          setHasAccess(true);
          return;
        }

    } else {
        // 4. Page is public, access is granted
        setHasAccess(true);
        return;
    }
    
    // Default to unauthorized if no other condition is met
    router.push('/unauthorized');
    setHasAccess(false);

  }, [isLoading, menuItems, user, userGroups, pageId, router]);

  return {
    hasAccess,
    isLoading
  };
}
