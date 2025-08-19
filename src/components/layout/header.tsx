
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Clock } from '@/components/clock';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import { Logo } from '../icons';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background">
      <div className="flex items-center gap-2 pl-4 md:pl-6">
        <SidebarTrigger />
         <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
            <Logo />
            <span className="text-primary text-lg">Adelia-ID</span>
          </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4 pr-4 md:pr-6">
        <Clock />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
