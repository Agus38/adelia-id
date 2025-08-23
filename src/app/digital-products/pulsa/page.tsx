
import { PulsaTransactionForm } from "@/components/digital-products/pulsa/transaction-form";
import { Smartphone } from 'lucide-react';

export default function PulsaPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Smartphone className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Isi Ulang Pulsa</h2>
      </div>
      <p className="text-muted-foreground max-w-xl">
        Masukkan nomor telepon tujuan Anda. Sistem akan secara otomatis mendeteksi operator dan menampilkan produk pulsa yang tersedia.
      </p>
      <div className="mt-6 flex justify-center">
        <PulsaTransactionForm />
      </div>
    </div>
  );
}
