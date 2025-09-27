
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifikasi</CardTitle>
        <CardDescription>
          Kelola cara Anda menerima notifikasi dari aplikasi ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="product-updates" className="text-base">Pembaruan Produk</Label>
            <p className="text-sm text-muted-foreground">
              Terima pemberitahuan saat ada produk baru atau perubahan harga.
            </p>
          </div>
          <Switch id="product-updates" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="promotions" className="text-base">Promosi & Penawaran</Label>
            <p className="text-sm text-muted-foreground">
              Dapatkan info tentang diskon, penawaran spesial, dan promosi lainnya.
            </p>
          </div>
          <Switch id="promotions" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="security-alerts" className="text-base">Notifikasi Keamanan</Label>
            <p className="text-sm text-muted-foreground">
              Terima peringatan tentang aktivitas login yang mencurigakan di akun Anda.
            </p>
          </div>
          <Switch id="security-alerts" defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
