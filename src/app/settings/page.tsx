
'use client';

import { Separator } from "@/components/ui/separator";
import { Settings, Printer, Bluetooth } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SettingsPage() {

  const handleConnectPrinter = () => {
    // In a real application, this would trigger the Web Bluetooth API flow.
    // For now, it's a placeholder.
    alert("Fungsionalitas untuk menghubungkan printer akan diimplementasikan di sini.");
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
      </div>
       <p className="text-muted-foreground">
        Kelola preferensi dan koneksi perangkat untuk aplikasi Anda.
      </p>
      <Separator />
      
      <Card>
          <CardHeader>
              <CardTitle>Pengaturan Perangkat & Printer</CardTitle>
              <CardDescription>
                Hubungkan aplikasi ke printer termal Bluetooth untuk mencetak struk transaksi secara nirkabel.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Cara Kerja</AlertTitle>
                  <AlertDescription>
                    Pastikan printer Bluetooth Anda sudah terhubung (paired) dengan perangkat Anda (ponsel/tablet/komputer). Kemudian, klik tombol di bawah untuk memulai pencarian dan koneksi perangkat.
                  </AlertDescription>
              </Alert>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                   <Printer className="h-6 w-6 text-muted-foreground" />
                   <div>
                      <p className="font-medium">Printer Bluetooth</p>
                      <p className="text-sm text-muted-foreground">Status: Belum Terhubung</p>
                   </div>
                </div>
                <Button variant="outline" onClick={handleConnectPrinter}>
                  <Bluetooth className="mr-2 h-4 w-4"/>
                  Hubungkan
                </Button>
              </div>
          </CardContent>
      </Card>
    </div>
  )
}
