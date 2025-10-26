
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuConfig } from '@/lib/menu-store';
import { useUserStore } from '@/lib/user-store';

type AccessStatus = 'loading' | 'granted' | 'denied_maintenance' | 'denied_auth' | 'denied_role';

export function usePageAccess(pageId: string) {
  const router = useRouter();
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const { user, loading: isLoadingUser } = useUserStore();
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('loading');
  const isLoading = isLoadingMenu || isLoadingUser;

  useEffect(() => {
    if (isLoading) {
      setAccessStatus('loading');
      return;
    }

    const menuItem = menuItems.find(item => item.id === pageId);
    
    if (!menuItem) {
      setAccessStatus('granted');
      return;
    }

    if (menuItem.isUnderMaintenance && user?.role !== 'Admin') {
      setAccessStatus('denied_maintenance');
      return;
    }
    
    if (menuItem.requiresAuth && !user) {
      setAccessStatus('denied_auth');
      return;
    }

    if (menuItem.access && menuItem.access !== 'all') {
      if (!user) {
        setAccessStatus('denied_auth');
        return;
      }
      if (user.role !== 'Admin' && user.role?.toLowerCase() !== menuItem.access.toLowerCase()) {
         setAccessStatus('denied_role');
         return;
      }
    }

    setAccessStatus('granted');

  }, [isLoading, menuItems, user, pageId]);
  
  useEffect(() => {
    // This effect handles the actual navigation based on the status.
    // It runs separately from the logic that determines the status,
    // preventing render-cycle conflicts.
    if (accessStatus === 'denied_maintenance') {
      router.push('/maintenance');
    } else if (accessStatus === 'denied_auth') {
      router.push('/login?redirect=' + pageId);
    } else if (accessStatus === 'denied_role') {
      router.push('/unauthorized');
    }
  }, [accessStatus, router, pageId]);


  return {
    hasAccess: accessStatus === 'granted',
    isLoading: accessStatus === 'loading'
  };
}
