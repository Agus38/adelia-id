
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
             <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">Akses Ditolak</CardTitle>
          <CardDescription className="text-lg">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Halaman ini hanya dapat diakses oleh pengguna dengan peran Administrator. Silakan hubungi admin jika Anda merasa ini adalah sebuah kesalahan.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
           <Link href="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
