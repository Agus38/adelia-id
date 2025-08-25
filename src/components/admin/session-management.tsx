
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
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function SessionManagement() {
  const [sessionDuration, setSessionDuration] = useState(24); // Default to 24 hours
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = () => {
    // NOTE: This is a mock action. The actual configuration is in the Supabase dashboard.
    setLoading(true);
    setTimeout(() => {
        toast({
            title: "Konfigurasi Disimpan (Simulasi)",
            description: `Durasi sesi telah diatur ke ${sessionDuration} jam. Jangan lupa untuk menerapkan ini di Supabase.`,
        });
        setLoading(false);
    }, 1000);
  };

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
              <AlertTitle>Penting: Konfigurasi di Dasbor Supabase</AlertTitle>
              <AlertDescription>
                Pengaturan durasi sesi yang sebenarnya dikontrol melalui dasbor Supabase Anda, bukan dari aplikasi ini. Form di bawah ini adalah untuk pencatatan dan panduan. Anda harus menerapkan nilai yang sama di Supabase agar berfungsi.
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
          <Button onClick={handleSaveChanges}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Konfigurasi (Simulasi)
          </Button>
          <Button variant="outline" asChild>
            <Link href="https://supabase.com/dashboard" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka Pengaturan Supabase
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Cara Mengatur Durasi Sesi di Supabase</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <ol className="list-decimal list-inside space-y-2">
                <li>Buka dasbor proyek Supabase Anda.</li>
                <li>Navigasi ke bagian <strong>Authentication</strong>, lalu pilih tab <strong>Providers</strong>.</li>
                <li>Pilih provider <strong>Email</strong>, di bawahnya akan ada opsi <strong>Session length</strong>.</li>
                <li>Masukkan durasi sesi yang Anda inginkan dalam detik (misalnya, 24 jam = 86400 detik).</li>
                <li>Klik <strong>Save</strong> untuk menyimpan perubahan.</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}
