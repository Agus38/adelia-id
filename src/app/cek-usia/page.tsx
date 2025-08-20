
import { AgeCalculator } from "@/components/cek-usia/age-calculator";
import { Cake } from 'lucide-react';

export default function CekUsiaPage() {
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
