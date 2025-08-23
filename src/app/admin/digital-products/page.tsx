
import { DigitalProductManagement } from "@/components/admin/digital-product-management";
import { Package } from "lucide-react";

export default function AdminDigitalProductsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Package className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Produk Digital</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola dan atur produk digital yang tersedia untuk dijual di aplikasi Anda.
      </p>
      <div className="pt-4">
        <DigitalProductManagement />
      </div>
    </div>
  );
}
