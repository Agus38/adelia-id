
import { AboutSettings } from "@/components/admin/about-settings";
import { Info } from "lucide-react";

export default function AdminAboutPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Info className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Halaman 'Tentang'</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola informasi yang ditampilkan pada halaman Tentang Aplikasi.
      </p>
      <div className="pt-4">
        <AboutSettings />
      </div>
    </div>
  );
}
