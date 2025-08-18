'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { Clock } from '@/components/clock';
import { UserNav } from './user-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <Clock />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Moon className="h-5 w-5" />
          <span className="sr-only">Toggle Theme</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
