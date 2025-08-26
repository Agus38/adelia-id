
'use client';

import { AgeCalculator } from "@/components/cek-usia/age-calculator";
import { Cake, Loader2 } from 'lucide-react';
import { usePageAccess } from "@/hooks/use-page-access";


export default function CekUsiaPage() {
  const { hasAccess, isLoading } = usePageAccess('cek-usia');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null; // The hook will handle the redirect.
  }

  return (
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8">
       <div className="flex-shrink-0">
         <div className="flex items-center space-x-2">
          <Cake className="h-8 w-8" />
          <h2 className="text-3xl font-bold tracking-tight">Cek Usia</h2>
        </div>
         <p className="text-muted-foreground mt-2">
          Masukkan tanggal lahir Anda untuk menghitung usia Anda secara akurat.
        </p>
       </div>
       <div className="flex-1 flex items-center justify-center pt-4">
        <div className="w-full max-w-4xl">
          <AgeCalculator />
        </div>
      </div>
    </div>
  );
}
