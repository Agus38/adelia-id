
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, HardDriveDownload, Package, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function DownloadProjectPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-3">
        <HardDriveDownload className="h-8 w-8" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unduh Proyek</h2>
          <p className="text-muted-foreground">
            Unduh seluruh kode sumber proyek ini sebagai file ZIP.
          </p>
        </div>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Perhatian</AlertTitle>
        <AlertDescription>
          File ZIP yang dihasilkan tidak akan menyertakan direktori `node_modules`, `.next`, `.git`, atau file `.env`. Anda perlu menjalankan `npm install` setelah mengekstrak file.
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4">Proyek Siap Diunduh</CardTitle>
          <CardDescription>
            Klik tombol di bawah untuk memulai proses pengarsipan dan pengunduhan proyek Anda. Proses ini mungkin memerlukan beberapa saat tergantung pada ukuran proyek.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ukuran file unduhan diperkirakan kurang dari 5MB.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild size="lg">
            <Link href="/api/download-project" prefetch={false}>
              <Download className="mr-2 h-5 w-5" />
              Unduh File ZIP
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
