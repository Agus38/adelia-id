
import { DigiflazzIntegration } from "@/components/admin/digiflazz-integration";
import { CreditCard } from "lucide-react";

export default function AdminDigiflazzPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Integrasi Digiflazz</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola koneksi API ke Digiflazz dan sinkronkan daftar produk.
      </p>
      <div className="pt-4">
        <DigiflazzIntegration />
      </div>
    </div>
  );
}
