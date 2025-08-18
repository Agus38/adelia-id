'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import Link from 'next/link';

export function UserNav() {
   const { isMobile } = useSidebar();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
         <div className="flex items-center gap-3">
           <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
             <Avatar className="h-9 w-9">
               <AvatarImage src="https://placehold.co/100x100.png" alt="@adelia" data-ai-hint="user avatar" />
               <AvatarFallback>A</AvatarFallback>
             </Avatar>
           </Button>
            {!isMobile && (
              <div className="text-left">
                  <p className="text-sm font-medium leading-none">Adelia</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Admin
                  </p>
              </div>
            )}
         </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Adelia</p>
            <p className="text-xs leading-none text-muted-foreground">
              adelia@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/admin">
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>Panel Admin</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
