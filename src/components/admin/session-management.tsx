
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Info, Loader2, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function SessionManagement() {
  const [sessionDuration, setSessionDuration] = useState(24); // Default to 24 hours
  const [loading, setLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();


  const handleSaveChanges = () => {
    // NOTE: This is a mock action. The actual configuration is in the Firebase dashboard.
    setLoading(true);
    setTimeout(() => {
        toast({
            title: "Konfigurasi Disimpan (Simulasi)",
            description: `Durasi sesi telah diatur ke ${sessionDuration} jam. Jangan lupa untuk menerapkan ini di Firebase.`,
        });
        setLoading(false);
    }, 1000);
  };

  const handleSignOutAll = async () => {
    setIsSigningOut(true);
     try {
        await signOut(auth);
        toast({
            title: "Berhasil Keluar",
            description: "Anda telah berhasil keluar dari semua perangkat.",
        });
        router.push('/login');
      } catch(error: any) {
         toast({
            title: "Error",
            description: "Gagal keluar dari sesi Anda: " + error.message,
            variant: "destructive",
        });
      } finally {
        setIsSigningOut(false);
      }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Durasi Sesi</CardTitle>
          <CardDescription>
            Tentukan berapa lama sesi pengguna tetap aktif sebelum mereka diminta untuk login kembali.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Penting: Konfigurasi di Dasbor Firebase</AlertTitle>
              <AlertDescription>
                Pengaturan durasi sesi sebenarnya dikontrol melalui Dasbor Otentikasi Firebase Anda, bukan dari aplikasi ini. Form di bawah ini adalah untuk pencatatan dan panduan. Anda harus menerapkan nilai yang sama di Firebase.
              </AlertDescription>
           </Alert>

           <div className="space-y-2 pt-4">
            <Label htmlFor="session-duration">Durasi Sesi (dalam jam)</Label>
            <Input
                id="session-duration"
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                min="1"
            />
             <p className="text-xs text-muted-foreground">
                Pengguna akan otomatis keluar setelah periode ini jika tidak aktif.
            </p>
           </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Konfigurasi (Simulasi)
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://console.firebase.google.com/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka Konsol Firebase
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Tindakan Sesi</CardTitle>
            <CardDescription>
                Kelola sesi aktif untuk akun Anda saat ini.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
               Jika Anda menduga akun Anda diakses dari perangkat yang tidak sah, Anda dapat keluar dari semua sesi aktif. Tindakan ini akan mengeluarkan Anda dari semua perangkat, termasuk yang ini.
            </p>
        </CardContent>
         <CardFooter>
             <Button variant="destructive" onClick={handleSignOutAll} disabled={isSigningOut}>
                {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <LogOut className="mr-2 h-4 w-4" />
                Keluar dari Semua Sesi Saya
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
