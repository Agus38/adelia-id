
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { toast } from '@/hooks/use-toast';
import { Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useSessionConfig, saveSessionConfig } from '@/lib/menu-store';

export function SessionManagement() {
  const { sessionConfig, isLoading: isLoadingConfig } = useSessionConfig();
  const [localDuration, setLocalDuration] = useState(0); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sessionConfig) {
      setLocalDuration(sessionConfig.durationMinutes);
    }
  }, [sessionConfig]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await saveSessionConfig({ durationMinutes: localDuration });
      toast({
        title: 'Konfigurasi Disimpan',
        description: `Durasi sesi otomatis telah diatur ke ${localDuration} menit.`,
      });
    } catch (error) {
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan konfigurasi sesi.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingConfig) {
     return (
       <Card>
          <CardHeader>
              <CardTitle>Pengaturan Durasi Sesi Otomatis</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
       </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Durasi Sesi Otomatis</CardTitle>
        <CardDescription>
          Tentukan berapa lama pengguna bisa tidak aktif sebelum dikeluarkan secara otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Bagaimana Ini Bekerja?</AlertTitle>
          <AlertDescription>
            Sistem akan melacak aktivitas pengguna (klik, ketikan) di sisi klien. Jika tidak ada aktivitas selama durasi yang ditentukan, pengguna akan otomatis dikeluarkan dari sesi mereka. Pengaturan ini berlaku untuk semua pengguna.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 pt-4">
          <Label htmlFor="session-duration">Durasi Sesi (dalam menit)</Label>
          <Input
            id="session-duration"
            type="number"
            value={localDuration}
            onChange={(e) => setLocalDuration(Math.max(0, Number(e.target.value)))}
            min="0"
          />
          <p className="text-xs text-muted-foreground">
            Masukkan `0` untuk menonaktifkan fitur logout otomatis. Direkomendasikan minimal 15 menit.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Konfigurasi
        </Button>
      </CardFooter>
    </Card>
  );
}
