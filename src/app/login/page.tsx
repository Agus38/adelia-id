
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { useUserStore } from '@/lib/user-store';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { setUserProfile } = useUserStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      let description = 'Terjadi kesalahan. Silakan coba lagi.';
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Email atau kata sandi yang Anda masukkan salah.';
          break;
        case 'auth/user-disabled':
          description = 'Akun ini telah dinonaktifkan sementara. Silakan hubungi administrator.';
          break;
        case 'auth/too-many-requests':
          description = 'Akses ke akun ini telah dinonaktifkan sementara karena terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.';
          break;
        case 'auth/invalid-email':
          description = 'Format email yang Anda masukkan tidak valid.';
          break;
        default:
          description = `Terjadi kesalahan autentikasi. Silakan coba lagi. (${authError.code})`;
      }
      setError(description);
      setIsLoading(false);
      return;
    }

    const user = userCredential.user;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === 'Diblokir') {
          await signOut(auth);
          setError('Akun Anda telah diblokir. Silakan hubungi administrator.');
          setIsLoading(false);
          return;
        }

        const fullUserProfile = {
            id: userDoc.id,
            uid: user.uid,
            ...userData,
        };
        
        // **CRITICAL FIX**: Explicitly set the full user profile in the store BEFORE navigating.
        setUserProfile(fullUserProfile as any);

        toast({
            title: 'Login Berhasil!',
            description: `Selamat datang kembali, ${userData.fullName || user.displayName || 'Pengguna'}!`,
        });

        // Now that the store is updated, proceed with navigation.
        if (userData.role === 'Admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
      } else {
        await signOut(auth);
        setError('Gagal memverifikasi data pengguna. Akun mungkin tidak terdaftar dengan benar. Hubungi administrator.');
        setIsLoading(false);
      }
    } catch (firestoreError: any) {
      console.error("Firestore verification error:", firestoreError);
      await signOut(auth);
      setError(`Terjadi kesalahan saat memverifikasi akun Anda. Silakan coba lagi.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
             <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Masuk</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan email Anda di bawah untuk masuk ke akun Anda
            </p>
          </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">Login Gagal</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
           <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Kata Sandi</Label>
                 <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                  Lupa kata sandi?
                </Link>
              </div>
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
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1599050751855-c4208a38dda8?q=80&w=1887&auto=format&fit=crop"
          alt="Image"
          width="1887"
          height="2830"
          data-ai-hint="business teamwork"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
