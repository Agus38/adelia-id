
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { LockKeyhole, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Tautan Terkirim',
        description: 'Jika email terdaftar, tautan untuk mengatur ulang kata sandi telah dikirim.',
      });
    } catch (error: any) {
       toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
     <div className="w-full lg:grid lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <LockKeyhole className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Lupa Kata Sandi?</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" required disabled={isLoading} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Tautan Atur Ulang
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
             <Link href="/login" className="underline">
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
         <Image
          src="https://images.unsplash.com/photo-1588590396420-55b01a8511a1?q=80&w=1887&auto=format&fit=crop"
          alt="Image"
          width="1887"
          height="1258"
          data-ai-hint="security lock"
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
}
