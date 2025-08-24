
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
import { LogIn, LogOut, Settings, User, Shield, LifeBuoy, FileText, Code, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function UserNav() {
  // NOTE: This is a mock authentication state.
  // Replace this with your actual authentication logic (e.g., from a context or hook).
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <Button>
            <LogIn className="mr-2 h-4 w-4"/>
            Masuk
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@adelia" data-ai-hint="user avatar" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </Button>
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
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuGroup>
          <Link href="/tim">
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Tim Kami</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/developer">
            <DropdownMenuItem>
              <Code className="mr-2 h-4 w-4" />
              <span>Developer</span>
            </DropdownMenuItem>
          </Link>
           <Link href="/support">
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Bantuan & Dukungan</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/terms-and-conditions">
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Syarat & Ketentuan</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <Link href="/admin">
            <DropdownMenuItem className="text-primary focus:text-primary">
              <Shield className="mr-2 h-4 w-4" />
              <span>Panel Admin</span>
            </DropdownMenuItem>
          </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
