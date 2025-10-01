
import { PromoPopupSettings } from "@/components/admin/promo-popup-settings";
import { Megaphone } from "lucide-react";

export default function PromoPopupManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Megaphone className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Popup Promosi</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola konten dan visibilitas popup promosi yang ditampilkan di halaman utama.
      </p>
      <div className="pt-4">
        <PromoPopupSettings />
      </div>
    </div>
  );
}
