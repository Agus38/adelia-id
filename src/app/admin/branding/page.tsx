
import { BrandingSettings } from "@/components/admin/branding-settings";
import { Palette } from "lucide-react";

export default function AdminBrandingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Palette className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Tampilan</h2>
      </div>
      <p className="text-muted-foreground">
        Sesuaikan identitas visual aplikasi Anda, termasuk logo, ikon, dan nama aplikasi.
      </p>
      <div className="pt-4">
        <BrandingSettings />
      </div>
    </div>
  );
}
