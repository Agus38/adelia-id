

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { LogIn, LogOut, Settings, User, Shield, LifeBuoy, FileText, Code, Users, Loader2, Info, X, Camera } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/user-store';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';

export function UserNav() {
  const router = useRouter();
  const { user, loading } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);


  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !auth.currentUser) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file gambar tidak boleh melebihi 1MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
      
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { avatarUrl: dataUrl });
      
      toast({
          title: "Avatar Diperbarui",
          description: "Foto profil Anda telah berhasil diubah.",
      });

    } catch (error) {
         toast({
            title: "Upload Gagal",
            description: "Gagal memproses gambar. Coba lagi.",
            variant: "destructive"
        });
    } finally {
        setIsUploading(false);
    }
  }


  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <Button size="sm" className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
        Memuat...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button asChild size="sm" className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm">
        <Link href="/login">
            <LogIn className="mr-2 h-4 w-4"/>
            Masuk
        </Link>
      </Button>
    );
  }
  
  const getAvatarFallback = (name?: string, email?: string) => {
    if (name) {
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
      if (initials) return initials.toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  }

  const roleBadgeVariant: { [key: string]: 'destructive' | 'secondary' | 'default' } = {
      'Admin': 'destructive',
      'Editor': 'default',
      'Khusus': 'default',
      'Pengguna': 'secondary',
  };

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl || user.photoURL || undefined} alt={user.fullName || user.email || ''} data-ai-hint="user avatar" />
              <AvatarFallback>{getAvatarFallback(user.fullName, user.email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DialogTrigger asChild>
              <DropdownMenuLabel className="font-normal cursor-pointer">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName || 'Pengguna'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
          </DialogTrigger>
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
            <Link href="/tentang">
              <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                <span>Tentang Aplikasi</span>
              </DropdownMenuItem>
            </Link>
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
                <DropdownMenuItem className="text-primary focus:bg-primary focus:text-primary-foreground">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Panel Admin</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-xs p-0 border-0">
         <div className="flex flex-col items-center text-center p-6 pb-4">
            <div className="relative">
                <Dialog>
                <DialogTrigger asChild>
                    <Avatar className="h-24 w-24 mb-4 cursor-zoom-in transition-transform hover:scale-105">
                        <AvatarImage src={user.avatarUrl || user.photoURL || undefined} alt={user.fullName || user.email || ''} data-ai-hint="user avatar" />
                        <AvatarFallback className="text-4xl">{getAvatarFallback(user.fullName, user.email)}</AvatarFallback>
                    </Avatar>
                </DialogTrigger>
                <DialogContent className="p-0 border-none max-w-md bg-transparent shadow-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Foto Profil {user.fullName}</DialogTitle>
                        <DialogDescription>Tampilan foto profil yang diperbesar.</DialogDescription>
                    </DialogHeader>
                    <Image 
                        src={user.avatarUrl || user.photoURL || "https://placehold.co/800x800.png"} 
                        alt={user.fullName || "User Avatar"} 
                        width={800} 
                        height={800}
                        className="rounded-lg object-contain w-full h-auto"
                    />
                    <DialogClose className="absolute -top-2 -right-2 rounded-full p-1 bg-background text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Tutup</span>
                    </DialogClose>
                </DialogContent>
                </Dialog>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 border-2 border-background" type="button" onClick={handleAvatarButtonClick} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4"/>}
                    <span className="sr-only">Ubah Foto</span>
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    disabled={isUploading}
                />
            </div>
            <DialogTitle className="text-2xl mt-4">{user.fullName || 'Pengguna'}</DialogTitle>
             {user.role && (
                <Badge key={user.role} variant={roleBadgeVariant[user.role] || 'secondary'} className="w-fit mx-auto mt-1">
                    {user.role}
                </Badge>
            )}
            <DialogDescription className="pt-2">{user.email}</DialogDescription>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-0 pt-4 border-t">
             <DialogClose asChild>
                <Button variant="ghost" className="rounded-none rounded-bl-lg">Tutup</Button>
            </DialogClose>
            <DialogClose asChild>
                 <Button asChild variant="ghost" className="rounded-none rounded-br-lg">
                    <Link href="/profile">Kelola Akun</Link>
                </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
