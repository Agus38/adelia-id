
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // We also check for 'Diblokir' status here as a first line of defense
      if (userDoc.exists() && userDoc.data().status === 'Diblokir') {
          await auth.signOut(); // Sign out the user immediately
          toast({
            title: 'Akun Diblokir',
            description: 'Akun Anda telah diblokir. Silakan hubungi administrator.',
            variant: 'destructive',
            duration: 5000,
          });
          setIsLoading(false);
          return;
      }

      toast({
        title: 'Login Berhasil!',
        description: 'Anda akan diarahkan...',
      });
      
      if (userDoc.exists() && userDoc.data().role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      let title = 'Login Gagal';
      let description = 'Terjadi kesalahan. Silakan coba lagi.';

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Email atau kata sandi yang Anda masukkan salah.';
          break;
        case 'auth/user-disabled':
          title = 'Akun Diblokir';
          description = 'Akun ini telah diblokir. Silakan hubungi administrator.';
          break;
        case 'auth/too-many-requests':
          title = 'Terlalu Banyak Percobaan';
          description = 'Akses ke akun ini telah dinonaktifkan sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.';
          break;
        case 'auth/invalid-email':
          description = 'Format email yang Anda masukkan tidak valid.';
          break;
        default:
          description = 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
      }
      
      toast({
        title: title,
        description: description,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Masuk ke Akun Anda</CardTitle>
            <CardDescription>Masukkan email dan kata sandi Anda untuk melanjutkan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'} kata sandi
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
            </Button>
            <div className="flex w-full items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Lupa kata sandi?
              </Link>
              <Link href="/register" className="text-muted-foreground hover:text-primary">
                Belum punya akun? Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
