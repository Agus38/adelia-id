
import { LoginPageSettings } from "@/components/admin/login-page-settings";
import { LogIn } from "lucide-react";

export default function AdminLoginPageSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <LogIn className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Halaman Login</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola gambar latar yang ditampilkan di halaman login untuk layar besar.
      </p>
      <div className="pt-4">
        <LoginPageSettings />
      </div>
    </div>
  );
}
