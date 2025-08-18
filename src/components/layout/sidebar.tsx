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
} from '@/components/ui/sidebar';
import { allMenuItems } from '@/lib/menu-items-v2';
import { Logo } from '../icons';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="font-semibold text-lg">Adelia-ID</h1>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          {allMenuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.title,
                    side: 'right',
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
