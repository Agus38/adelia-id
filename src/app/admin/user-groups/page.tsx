
import { UserGroupManagement } from "@/components/admin/user-group-management";
import { UsersRound } from "lucide-react";

export default function UserGroupsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <UsersRound className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Grup Pengguna</h2>
      </div>
      <p className="text-muted-foreground">
        Buat grup, kelola anggota, dan atur hak akses menu untuk setiap peran pengguna di aplikasi Anda.
      </p>
      <div className="pt-4">
        <UserGroupManagement />
      </div>
    </div>
  );
}
