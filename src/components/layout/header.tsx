'use client';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Clock } from '@/components/clock';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';

export function Header() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Clock />
        <ThemeToggle />
        {!isMobile && <UserNav />}
      </div>
    </header>
  );
}
