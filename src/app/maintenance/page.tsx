
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
             <Wrench className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">Fitur dalam Perbaikan</CardTitle>
          <CardDescription className="text-lg">
            Maaf, halaman atau fitur yang Anda tuju sedang dalam pemeliharaan.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">
            Kami sedang bekerja keras untuk membuatnya lebih baik. Silakan coba lagi nanti.
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
