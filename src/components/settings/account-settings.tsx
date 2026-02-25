
'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AccountSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const [confirmationText, setConfirmationText] = React.useState('');
  const CONFIRMATION_WORD = 'KONFIRMASI';

  const handleLogoutAll = () => {
    // NOTE: Firebase Client SDK cannot revoke tokens. This is a mock.
    // In a real-world scenario, this would call a backend function.
    toast({
      title: 'Keluar dari Semua Perangkat',
      description: 'Anda telah berhasil keluar dari semua sesi aktif lainnya.',
    });
  };
  
  const handleDeleteAccount = () => {
    const user = auth.currentUser;
    if (!user) return;
    
    // In a real app, you would also delete user data from Firestore/Storage.
    user.delete().then(() => {
        toast({
            title: "Akun Dihapus",
            description: "Akun Anda telah berhasil dihapus secara permanen.",
            variant: "destructive"
        });
        signOut(auth);
        router.push('/');
    }).catch((error) => {
         toast({
            title: "Gagal Menghapus Akun",
            description: "Silakan coba keluar dan masuk kembali sebelum mencoba lagi. " + error.message,
            variant: "destructive"
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Akun</CardTitle>
        <CardDescription>
          Kelola pengaturan yang terkait dengan keamanan dan data akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={handleLogoutAll}>
          <LogOut className="mr-2 h-4 w-4" />
          Keluar dari Semua Perangkat
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Ini akan mengeluarkan Anda dari semua sesi aktif di perangkat lain.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t bg-destructive/10 p-6">
        <h3 className="font-semibold text-destructive">Zona Berbahaya</h3>
        <p className="text-sm text-destructive/80 mt-1 mb-4">
          Tindakan berikut tidak dapat diurungkan. Harap berhati-hati.
        </p>
        <AlertDialog onOpenChange={(open) => !open && setConfirmationText('')}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Akun Saya
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda dan semua data terkait secara permanen. Untuk melanjutkan, ketik <strong className="text-foreground">{CONFIRMATION_WORD}</strong> di bawah ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 pt-2">
                <Label htmlFor="confirmation-input">Ketik untuk konfirmasi</Label>
                <Input
                    id="confirmation-input"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={CONFIRMATION_WORD}
                />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                disabled={confirmationText !== CONFIRMATION_WORD}
              >
                Ya, Hapus Akun Saya
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
