
import { SupportSettings } from "@/components/admin/support-settings";
import { LifeBuoy } from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <LifeBuoy className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Halaman Bantuan</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola item FAQ dan metode kontak yang ditampilkan di halaman dukungan.
      </p>
      <div className="pt-4">
        <SupportSettings />
      </div>
    </div>
  );
}
