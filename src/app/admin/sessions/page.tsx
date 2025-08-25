
import { SessionManagement } from "@/components/admin/session-management";
import { Lock } from "lucide-react";

export default function AdminSessionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Lock className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Sesi</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola dan pantau sesi pengguna yang aktif di seluruh aplikasi.
      </p>
      <div className="pt-4">
        <SessionManagement />
      </div>
    </div>
  );
}
