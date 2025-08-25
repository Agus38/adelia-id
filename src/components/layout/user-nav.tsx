
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
import { LogIn, LogOut, Settings, User, Shield, LifeBuoy, FileText, Code, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/layout';

interface UserNavProps {
  user: UserProfile | null;
  loading: boolean;
}

export function UserNav({ user, loading }: UserNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
     return (
        <Button size="sm" disabled className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            Memuat...
        </Button>
     )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button size="sm" className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
            <LogIn className="mr-2 h-4 w-4"/>
            Masuk
        </Button>
      </Link>
    );
  }
  
  const getAvatarFallback = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar_url || user.user_metadata?.avatar_url} alt={user.full_name || user.email} data-ai-hint="user avatar" />
            <AvatarFallback>{getAvatarFallback(user.full_name, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name || 'Pengguna'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
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
         {user && user.role === 'Admin' && (
          <>
            <Link href="/admin">
              <DropdownMenuItem className="text-primary focus:text-primary">
                <Shield className="mr-2 h-4 w-4" />
                <span>Panel Admin</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
         )}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
