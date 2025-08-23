
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Separator } from '../ui/separator';

export function DigiflazzIntegration() {
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save this to a secure config.
    console.log('Saving Digiflazz credentials:', { username });
    toast({
      title: 'Perubahan Disimpan!',
      description: 'Kredensial API Digiflazz telah berhasil disimpan.',
    });
  };

  const handleSyncProducts = () => {
    setIsSyncing(true);
    // NOTE: Mock implementation. In a real app, this would trigger a server-side flow.
    console.log('Syncing products from Digiflazz...');
    setTimeout(() => {
        setIsSyncing(false);
        toast({
            title: 'Sinkronisasi Selesai!',
            description: 'Daftar produk dari Digiflazz telah diperbarui. (Simulasi)',
        });
    }, 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Pengaturan API</CardTitle>
                <CardDescription>
                Masukkan kredensial API Anda untuk terhubung ke layanan Digiflazz.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username Digiflazz Anda"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apiKey">Production API Key</Label>
                    <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveChanges}>Simpan Kredensial</Button>
            </CardFooter>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Sinkronisasi Produk</CardTitle>
                <CardDescription>
                Tarik daftar produk terbaru dari Digiflazz ke database lokal Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Status Sinkronisasi</p>
                    <p className="text-sm text-muted-foreground">
                       Terakhir sinkronisasi: - <br/>
                       Total produk: 0 (Pulsa), 0 (Paket Data), 0 (Token Listrik), 0 (Game)
                    </p>
                </div>
                 <Separator className="my-6" />
                 <p className="text-sm text-muted-foreground">
                    Menekan tombol di bawah ini akan memulai proses sinkronisasi di latar belakang. Ini mungkin memerlukan beberapa menit. Produk yang ada akan diperbarui dan produk baru akan ditambahkan.
                 </p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSyncProducts} disabled={isSyncing}>
                    {isSyncing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {isSyncing ? 'Menyinkronkan...' : 'Mulai Sinkronisasi'}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
