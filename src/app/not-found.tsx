import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
             <TriangleAlert className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">404 - Halaman Tidak Ditemukan</CardTitle>
          <CardDescription className="text-lg">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Silakan periksa kembali URL yang Anda masukkan atau kembali ke halaman utama.
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
