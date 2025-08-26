
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Printer, Bluetooth, XCircle, Loader2, CheckCircle, ExternalLink, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectPrinter = async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth API tidak didukung di browser ini. Coba gunakan Chrome.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      // Common UUID for Serial Port Profile (SPP), often used by Bluetooth printers
      const requestedDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['00001101-0000-1000-8000-00805f9b34fb'] }],
        // acceptAllDevices: true, // Use this if the filter above doesn't work
      });

      setDevice(requestedDevice);
      
      const server = await requestedDevice.gatt?.connect();
      if (!server) throw new Error("Gagal terhubung ke GATT server.");

      // This is a common service/characteristic for many thermal printers, but may vary
      // You might need to discover services and characteristics if this fails
      const service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
      const char = await service.getCharacteristic('00001102-0000-1000-8000-00805f9b34fb');

      setCharacteristic(char);
      setIsConnected(true);
      toast({
        title: 'Printer Terhubung!',
        description: `Berhasil terhubung ke perangkat: ${requestedDevice.name}`,
      });

    } catch (err: any) {
      console.error('Koneksi Gagal:', err);
      if (err.name === 'NotFoundError') {
        setError('Tidak ada perangkat yang dipilih atau ditemukan.');
      } else if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
        setError('Akses Bluetooth dibatasi oleh kebijakan keamanan browser. Coba buka aplikasi di tab baru atau pastikan Anda menggunakan koneksi aman (HTTPS).');
      } else {
        setError(err.message);
      }
       toast({
        title: 'Koneksi Gagal',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
    setIsConnected(false);
    setError(null);
     toast({
      title: 'Koneksi Terputus',
      description: 'Koneksi ke printer telah ditutup.',
    });
  };

  const handleTestPrint = async () => {
    if (!characteristic) {
      toast({ title: 'Error', description: 'Tidak ada printer yang terhubung.', variant: 'destructive' });
      return;
    }
    
    try {
      const encoder = new TextEncoder();
      const testMessage = 
        '\nAdelia-ID Print Test\n' +
        '--------------------\n' +
        'Jika Anda bisa membaca ini,\n' +
        'koneksi printer berhasil!\n\n\n';
      
      await characteristic.writeValue(encoder.encode(testMessage));

       toast({
        title: 'Cetak Tes Terkirim',
        description: 'Data tes telah dikirim ke printer.',
      });

    } catch (err: any) {
       console.error('Gagal Mencetak:', err);
       toast({
        title: 'Gagal Mencetak',
        description: err.message,
        variant: 'destructive',
      });
    }
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
                  <AlertTitle>Cara Kerja & Kompatibilitas</AlertTitle>
                  <AlertDescription>
                     Fitur ini menggunakan Web Bluetooth API yang paling baik didukung di browser Chrome (Desktop & Android). Pastikan printer Bluetooth Anda sudah terhubung (paired) dengan perangkat Anda sebelum memulai.
                     <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility" target="_blank" className="text-primary hover:underline flex items-center gap-1 mt-2">
                        Lihat kompatibilitas browser <ExternalLink className="h-3 w-3"/>
                     </Link>
                  </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Terjadi Kesalahan</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                   <Printer className="h-6 w-6 text-muted-foreground" />
                   <div>
                      <p className="font-medium">Printer Bluetooth</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {isConnecting ? 'Menyambungkan...' : isConnected ? `Terhubung ke ${device?.name}` : 'Belum Terhubung'}
                      </p>
                   </div>
                </div>
                 {!isConnected ? (
                     <Button variant="outline" onClick={handleConnectPrinter} disabled={isConnecting}>
                        {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bluetooth className="mr-2 h-4 w-4"/>}
                        {isConnecting ? 'Mencari...' : 'Hubungkan'}
                    </Button>
                 ) : (
                     <Button variant="destructive" onClick={handleDisconnectPrinter}>
                        <XCircle className="mr-2 h-4 w-4"/>
                        Putuskan
                    </Button>
                 )}
              </div>
          </CardContent>
           <CardFooter>
                <Button onClick={handleTestPrint} disabled={!isConnected || isConnecting}>
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Tes
                </Button>
            </CardFooter>
      </Card>
    </div>
  )
}
