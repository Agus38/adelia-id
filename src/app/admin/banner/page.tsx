
import { BannerManagement } from "@/components/admin/banner-management";
import { ImageIcon } from "lucide-react";

export default function BannerManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <ImageIcon className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Banner</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola banner carousel yang ditampilkan di halaman utama.
      </p>
      <div className="pt-4">
        <BannerManagement />
      </div>
    </div>
  );
}
