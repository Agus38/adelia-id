
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegisterPageConfig } from '@/lib/menu-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/user-store';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  width: string;
}

const PasswordStrengthIndicator = ({ strength }: { strength: PasswordStrength }) => {
  if (!strength.label) return null;

  return (
    <div className="space-y-2">
      <Progress value={strength.score * 25} className={cn("h-2 transition-all", strength.color)} />
      <p className={`text-xs font-medium ${strength.color === 'bg-destructive' ? 'text-destructive' : strength.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
        Kekuatan: {strength.label}
      </p>
    </div>
  );
};


export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, label: '', color: '', width: '0%' });
  const { toast } = useToast();
  const router = useRouter();
  const { registerPageConfig, isLoading: isLoadingConfig } = useRegisterPageConfig();
  const { user, loading: userLoading } = useUserStore();

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const calculateStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length > 7) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (password.length === 0) {
      return { score: 0, label: '', color: '', width: '0%' };
    }

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'Lemah', color: 'bg-destructive', width: '25%' };
      case 2:
        return { score: 2, label: 'Sedang', color: 'bg-yellow-500', width: '50%' };
      case 3:
        return { score: 3, label: 'Kuat', color: 'bg-green-500', width: '75%' };
      case 4:
        return { score: 4, label: 'Sangat Kuat', color: 'bg-green-500', width: '100%' };
      default:
        return { score: 0, label: '', color: '', width: '0%' };
    }
  };


  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Kata sandi dan konfirmasi tidak cocok.");
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setStrength(calculateStrength(newPassword));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
     if (!termsAccepted) {
      toast({
        title: 'Persetujuan Diperlukan',
        description: 'Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Kata sandi dan konfirmasi kata sandi tidak cocok.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      
      // 2. Send email verification
      await sendEmailVerification(authUser);
      
      // 3. Update basic profile in Firebase Authentication.
      await updateProfile(authUser, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      });
      
      // 4. Create the Firestore user document directly, ensuring 'name' is captured.
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocData = {
        uid: authUser.uid,
        email: authUser.email,
        fullName: name, // Use the 'name' state directly
        role: 'Pengguna',
        status: 'Aktif',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: serverTimestamp(),
      };
      
      setDoc(userDocRef, userDocData).catch((serverError) => {
          const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userDocData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
      
      // 5. Sign out the user immediately so they have to log in after verification.
      await signOut(auth);
      
      // 6. Redirect to the check-email page instead of showing a toast
      router.push('/check-email');

    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Kata sandi terlalu lemah. Harap gunakan minimal 6 karakter.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
      }
      
      toast({
        title: 'Pendaftaran Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || !name || !email || !password || !confirmPassword || !termsAccepted || !!passwordError;

  if (userLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
     <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Buat Akun</h1>
            <p className="text-balance text-muted-foreground">
              Isi formulir di bawah untuk mendaftar.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
             <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" type="text" placeholder="Nama Anda" required disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={handlePasswordChange}
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
              {password.length > 0 && <PasswordStrengthIndicator strength={strength} />}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi"
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(passwordError && "border-destructive focus-visible:ring-destructive")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {passwordError && (
                 <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <p>{passwordError}</p>
                 </div>
               )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} disabled={isLoading} />
              <Label
                htmlFor="terms"
                className="text-sm font-normal text-muted-foreground"
              >
                Saya setuju dengan{" "}
                <Link
                  href="/terms-and-conditions"
                  className="underline underline-offset-4 hover:text-primary"
                  target="_blank"
                >
                  Syarat &amp; Ketentuan
                </Link>
                .
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitDisabled} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat Akun
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {isLoadingConfig ? (
          <Skeleton className="h-full w-full" />
        ) : (
         <Image
          src={registerPageConfig.imageUrl}
          alt="Image"
          width="1887"
          height="1258"
          data-ai-hint={registerPageConfig.aiHint}
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
        )}
      </div>
    </div>
  );
}
