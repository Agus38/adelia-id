
import { AuthPagesSettings } from "@/components/admin/auth-pages-settings";
import { UserPlus } from "lucide-react";

export default function AuthPagesSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <UserPlus className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Halaman Autentikasi</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola gambar latar yang ditampilkan di halaman Login dan Registrasi.
      </p>
      <div className="pt-4">
        <AuthPagesSettings />
      </div>
    </div>
  );
}
