
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegisterPageConfig } from '@/lib/menu-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStore } from '@/lib/user-store';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { registerPageConfig, isLoading: isLoadingConfig } = useRegisterPageConfig();
  const { user, loading: userLoading } = useUserStore();

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/');
    }
  }, [user, userLoading, router]);


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
      
      const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: true,
      };

      // 2. Send email verification
      await sendEmailVerification(authUser, actionCodeSettings);
      
      // Store email in local storage to retrieve it on the login page after verification
      window.localStorage.setItem('emailForSignIn', email);

      // 3. Update basic profile in Firebase Authentication.
      await updateProfile(authUser, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      });
      
      const userDocRef = doc(db, "users", authUser.uid);

      // 4. Create user document in Firestore.
      await setDoc(userDocRef, {
        uid: authUser.uid,
        email: authUser.email,
        fullName: name,
        role: 'Pengguna',
        status: 'Aktif',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: serverTimestamp(),
      });
      
      // 5. Add user to the default group (if configured)
      const defaultGroupConfigDoc = await getDoc(doc(db, 'app-settings', 'defaultUserGroup'));
      if (defaultGroupConfigDoc.exists()) {
          const { groupId } = defaultGroupConfigDoc.data();
          if (groupId) {
              const groupDocRef = doc(db, 'userGroups', groupId);
              await updateDoc(groupDocRef, {
                  memberIds: arrayUnion(authUser.uid)
              });
          }
      }

      // 6. Sign out the user immediately so they have to log in after verification.
      await signOut(auth);
      
      // 7. Show success toast and redirect to login page.
      toast({
        title: 'Pendaftaran Berhasil!',
        description: `Silakan periksa email Anda untuk melakukan verifikasi sebelum masuk.`,
        duration: 8000,
      });
      router.push('/login');

    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
      }
      
      console.error("Registration error:", error);
      
      toast({
        title: 'Pendaftaran Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || !name || !email || !password || !confirmPassword || !termsAccepted;

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
                  placeholder="Minimal 6 karakter"
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
