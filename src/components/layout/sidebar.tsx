

'use client';

import Link from 'next/link';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '../icons';
import { UserNav } from './user-nav';
import { Shield, Loader2 } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { useSidebarMenuConfig, useAdminSidebarMenuConfig } from '@/lib/menu-store';
import { useUserStore } from '@/lib/user-store';

interface AppSidebarProps {
}

export function AppSidebar({ }: AppSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useUserStore();
  const { sidebarMenuItems, isLoading: isLoadingSidebar } = useSidebarMenuConfig();
  const { adminSidebarMenuItems, isLoading: isLoadingAdminSidebar } = useAdminSidebarMenuConfig();
  const isAdminPage = pathname.startsWith('/admin');

  const isLoading = isLoadingSidebar || isLoadingAdminSidebar;

  // Filter items based on user role
  const filteredSidebarItems = React.useMemo(() => {
    if (!user) {
        return sidebarMenuItems.filter(item => item.access === 'all' || !item.access);
    }
    if (user.role === 'Admin') {
      return sidebarMenuItems; // Admins see all sidebar items
    }
    return sidebarMenuItems.filter(item => {
        if (!item.access || item.access === 'all') {
            return true;
        }
        return user.role?.toLowerCase() === item.access.toLowerCase();
    });
  }, [sidebarMenuItems, user]);

  const itemsToDisplay = isAdminPage ? adminSidebarMenuItems : filteredSidebarItems;

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
       {isMobile && (
        <SidebarHeader className="border-b">
           <div className="flex items-center gap-2 font-semibold">
              <Logo />
              <span className="text-primary text-lg">Adelia-ID</span>
            </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        {isAdminPage && !isMobile && (
           <div className="p-2 group-data-[collapsible=icon]:hidden">
              <div className="p-2 rounded-md bg-muted text-center">
                <Shield className="inline-block h-5 w-5 mb-1" />
                <p className="text-sm font-semibold">Mode Admin</p>
              </div>
           </div>
        )}

        <SidebarMenu>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            itemsToDisplay.map((item) => {
              const href = item.isUnderMaintenance ? '/maintenance' : item.href;
              return (
                <SidebarMenuItem key={item.id} onClick={handleMenuItemClick}>
                  <Link href={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href && !item.isUnderMaintenance}
                      tooltip={{
                        children: item.title,
                        side: 'right',
                      }}
                    >
                      <span>
                        <item.icon />
                        <span>{item.title}</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            })
          )}
        </SidebarMenu>
        
        <SidebarFooter className="mt-auto group-data-[collapsible=icon]:hidden">
          <SidebarSeparator />
           <div className="p-2 flex items-center justify-between">
              <div>
                {!isMobile && <UserNav />}
              </div>
           </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
