'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Kata sandi dan konfirmasi kata sandi tidak cocok.',
        variant: 'destructive',
      });
      return;
    }
     if (!termsAccepted) {
      toast({
        title: 'Persetujuan Diperlukan',
        description: 'Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update basic profile in Firebase Authentication. This is quick.
      await updateProfile(user, {
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      });

      // 3. Create user document in Firestore. With the corrected security rules, this will now succeed.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: name,
        role: email === 'server64462@gmail.com' ? 'Admin' : 'Pengguna', // Correctly assign Admin role
        status: 'Aktif',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: serverTimestamp(),
      });
      
      // 4. Show success and redirect
      toast({
        title: 'Pendaftaran Berhasil!',
        description: 'Akun Anda telah dibuat. Anda akan diarahkan ke halaman login.',
      });
      router.push('/login');

    } catch (error: any) {
        let errorMessage = 'Terjadi kesalahan saat pendaftaran.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
        } else {
            console.error("Registration error:", error);
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

  const isSubmitDisabled = isLoading || !name || !email || !password || !confirmPassword || !termsAccepted;

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
                  Syarat & Ketentuan
                </Link>
                .
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
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
         <Image
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1887&auto=format&fit=crop"
          alt="Image"
          width="1887"
          height="1258"
          data-ai-hint="team working"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
