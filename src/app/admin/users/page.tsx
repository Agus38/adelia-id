import { UserManagement } from "@/components/admin/user-management";
import { Users } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Users className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola semua akun pengguna, peran, dan izin di platform.
      </p>
      <div className="pt-4">
        <UserManagement />
      </div>
    </div>
  );
}
