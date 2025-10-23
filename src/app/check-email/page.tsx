
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
             <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">Periksa Email Anda</CardTitle>
          <CardDescription className="text-lg">
            Kami telah mengirimkan tautan verifikasi ke alamat email Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Silakan klik tautan di email tersebut untuk mengaktifkan akun Anda. Jika Anda tidak menemukannya, periksa folder <strong>spam</strong> atau <strong>promosi</strong> Anda.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
           <Link href="/login">
            <Button>Kembali ke Halaman Masuk</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
