
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, sendEmailVerification, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserStore } from '@/lib/user-store';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading, setUserProfile } = useUserStore();
  
  useEffect(() => {
    // Handle email verification link
    const handleVerification = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let emailFromStorage = window.localStorage.getItem('emailForSignIn');
            if (!emailFromStorage) {
                emailFromStorage = window.prompt('Harap berikan email Anda untuk konfirmasi');
            }

            if (emailFromStorage) {
                try {
                    // Sign in user with email link. This will trigger onAuthStateChanged.
                    await signInWithEmailLink(auth, emailFromStorage, window.location.href);
                    
                    // The user-store listener will now handle document creation.
                    setSuccess('Email Anda telah berhasil diverifikasi. Anda akan segera dialihkan...');
                    window.localStorage.removeItem('emailForSignIn');

                    // No need to sign out. Let the user store handle the session.
                    // The redirect will happen via the user/userLoading useEffect.
                } catch (linkError) {
                    setError("Tautan verifikasi tidak valid atau telah kedaluwarsa.");
                    if(auth.currentUser) await signOut(auth);
                }
            } else {
                 setError("Gagal memverifikasi email. Email tidak ditemukan.");
            }
        }
        setIsVerifying(false);
    };
    
    handleVerification();
  // We only want to run this once on component mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
        const redirectPath = searchParams.get('redirect') || '/';
        router.push(redirectPath);
    }
  }, [user, userLoading, router, searchParams]);

  // This function is no longer needed here as the logic is moved to user-store.
  // It's kept for reference but should be removed in a future cleanup.
  const ensureUserDocument = async (authUser: import('firebase/auth').User) => {
      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
          // This logic is now in user-store.ts
      }
      return await getDoc(userDocRef);
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user && !userCredential.user.emailVerified) {
        const actionCodeSettings = {
            url: `${window.location.origin}/login`,
            handleCodeInApp: true,
        };
        await sendEmailVerification(userCredential.user, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        toast({
          title: 'Email Verifikasi Terkirim',
          description: 'Email verifikasi baru telah dikirimkan. Harap periksa kotak masuk dan folder spam Anda.',
        });
      }
      await signOut(auth); // Sign out immediately
    } catch (authError: any) {
      setError('Gagal mengirim ulang verifikasi. Pastikan email dan kata sandi benar.');
    } finally {
      setIsResending(false);
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;

      // The onAuthStateChanged listener in user-store now handles all profile fetching,
      // document creation, and state setting. We just need to trigger it by signing in.
      
      // Check for email verification, except for Admins who can bypass it.
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDoc = await getDoc(userDocRef);
      const isPotentiallyAdmin = userDoc.exists() && userDoc.data().role === 'Admin';
      
      if (!authUser.emailVerified && !isPotentiallyAdmin) {
          await signOut(auth);
          setError('Email Anda belum diverifikasi. Silakan periksa kotak masuk Anda atau kirim ulang email verifikasi.');
          setIsLoading(false);
          return;
      }
      
      // If sign-in is successful, the useEffect for [user, userLoading] will handle the redirect.
      // We don't need to do anything else here.
      
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
    }
    // No finally block needed to set isLoading to false, as it's handled on success by redirect or on error in catch.
  };
  
  if (userLoading || isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
                {error.includes('verifikasi') && (
                <Button
                    variant="link"
                    className="p-0 h-auto mt-2 text-xs"
                    onClick={handleResendVerification}
                    disabled={isResending}
                >
                    {isResending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Kirim ulang email verifikasi
                </Button>
                )}
            </AlertDescription>
            </Alert>
        )}
        {success && (
            <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base text-green-800 dark:text-green-300">Berhasil</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">{success}</AlertDescription>
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
  );
}
