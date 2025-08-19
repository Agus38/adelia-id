
'use client';

import Link from 'next/link';
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
import { allMenuItems, adminMenuItems } from '@/lib/menu-items-v2';
import { Logo } from '../icons';
import { UserNav } from './user-nav';
import { Shield } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const isAdminPage = pathname.startsWith('/admin');

  const itemsToDisplay = isAdminPage ? adminMenuItems : allMenuItems.filter(item => item.access !== 'admin');

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="font-semibold text-lg">Adelia-ID</h1>
          </div>
        </SidebarHeader>

        {isAdminPage && (
           <div className="p-2 group-data-[collapsible=icon]:hidden">
              <div className="p-2 rounded-md bg-muted text-center">
                <Shield className="inline-block h-5 w-5 mb-1" />
                <p className="text-sm font-semibold">Mode Admin</p>
              </div>
           </div>
        )}

        <SidebarMenu>
          {itemsToDisplay.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
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
          ))}
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
