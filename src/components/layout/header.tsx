
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import { Logo } from '../icons';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
         <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
            <Logo />
            <span className="text-primary text-lg">Adelia-ID</span>
          </Link>
      </div>
      
      {/* Centered Logo for Mobile */}
      <div className="flex-1 flex justify-center md:hidden">
         <Link href="/" className="items-center gap-2 font-semibold flex">
            <Logo />
            <span className="text-primary text-lg">Adelia-ID</span>
          </Link>
      </div>


      <div className="flex items-center gap-4 md:flex-1 md:justify-end">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
