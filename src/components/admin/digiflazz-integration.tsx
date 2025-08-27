
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, RefreshCw, Copy, AlertTriangle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function DigiflazzIntegration() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    // This runs on the client, so window is available.
    setWebhookUrl(`${window.location.origin}/api/webhooks/digiflazz`);
  }, []);
  
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

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'URL Webhook Disalin!',
      description: 'URL telah disalin ke clipboard Anda.',
    });
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Pengaturan API</CardTitle>
                    <CardDescription>
                    Konfigurasi kredensial API Anda untuk terhubung ke layanan Digiflazz.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Penting: Pengaturan Sisi Server</AlertTitle>
                        <AlertDescription>
                            Untuk keamanan, kredensial API Digiflazz (Username, API Key, dan Webhook Secret) harus diatur dalam file `.env` di lingkungan server Anda. Jangan menyimpannya di sini.
                        </AlertDescription>
                    </Alert>
                </CardContent>
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
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Webhook</CardTitle>
                <CardDescription>
                    Gunakan URL ini untuk mengizinkan Digiflazz mengirim pembaruan status transaksi secara real-time ke aplikasi Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="webhookUrl">URL Webhook Anda</Label>
                    <div className="flex gap-2 mt-2">
                        <Input id="webhookUrl" value={webhookUrl} readOnly />
                        <Button variant="outline" size="icon" onClick={handleCopyWebhookUrl}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Salin URL</span>
                        </Button>
                    </div>
                </div>
                 <div>
                    <Label>Kunci Rahasia Webhook (Signature)</Label>
                    <Input value="Atur nilai ini di file .env Anda (variabel DIGIFLAZZ_WEBHOOK_SECRET)" readOnly disabled className="mt-2" />
                     <p className="text-xs text-muted-foreground mt-2">
                        Masukkan kunci rahasia ini di file environment Anda untuk memverifikasi permintaan webhook.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 border-t pt-6 text-sm text-muted-foreground">
                <p className="font-semibold">Cara Menggunakan:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Salin URL Webhook di atas.</li>
                    <li>Masuk ke akun Digiflazz Anda dan navigasikan ke pengaturan developer atau API.</li>
                    <li>Tempelkan URL di kolom "URL Webhook" yang tersedia.</li>
                    <li>Simpan perubahan di dashboard Digiflazz.</li>
                </ul>
            </CardFooter>
        </Card>
    </div>
  );
}
