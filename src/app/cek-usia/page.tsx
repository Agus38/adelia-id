
import { AgeCalculator } from "@/components/cek-usia/age-calculator";
import { Cake } from 'lucide-react';

export default function CekUsiaPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <Cake className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Cek Usia</h2>
      </div>
       <p className="text-muted-foreground">
        Masukkan tanggal lahir Anda untuk menghitung usia Anda secara akurat.
      </p>
       <div className="pt-4">
        <AgeCalculator />
      </div>
    </div>
  );
}
