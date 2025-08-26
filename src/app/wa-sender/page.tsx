
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, XCircle, Bluetooth } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WaSenderPage() {
  const [text, setText] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnectPrinter = async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth API tidak didukung di browser ini.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const requestedDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      if (!requestedDevice) {
        throw new Error('Tidak ada perangkat yang dipilih.');
      }
      
      setDevice(requestedDevice);
      
      const server = await requestedDevice.gatt?.connect();
      if (!server) throw new Error("Gagal terhubung ke GATT server.");

      const services = await server.getPrimaryServices();
      let foundCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            foundCharacteristic = char;
            break;
          }
        }
        if (foundCharacteristic) break;
      }
      
      if (!foundCharacteristic) {
        throw new Error("Tidak ditemukan karakteristik yang dapat ditulis.");
      }

      setCharacteristic(foundCharacteristic);
      setIsConnected(true);
      toast({
        title: 'Printer Terhubung!',
        description: `Terhubung ke: ${requestedDevice.name}`,
      });

    } catch (err: any) {
      console.error('Koneksi Gagal:', err);
      setError(`Koneksi Gagal: ${err.message}`);
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

  const handlePrint = async () => {
    if (!characteristic) {
      toast({ title: 'Error', description: 'Tidak ada printer yang terhubung.', variant: 'destructive' });
      return;
    }
    if (!text) {
        toast({ title: 'Error', description: 'Teks tidak boleh kosong.', variant: 'destructive' });
        return;
    }
    
    try {
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(text + '\n\n\n'));
       toast({
        title: 'Terkirim!',
        description: 'Data telah dikirim ke printer.',
      });
    } catch (err: any) {
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
        <Printer className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">WA Sender / Cetak Manual</h2>
      </div>
      <p className="text-muted-foreground">
        Gunakan halaman ini untuk mengirim teks mentah ke printer Bluetooth Anda.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Status Printer</CardTitle>
          <CardDescription>
            Hubungkan ke printer termal untuk memulai pencetakan.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
                <Alert variant="destructive" className="mb-4">
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
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Konten Cetak</CardTitle>
          <CardDescription>
            Masukkan teks yang ingin Anda cetak di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Ketik struk atau teks apa pun di sini..."
            disabled={!isConnected}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handlePrint} disabled={!isConnected || !text}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak Teks
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
