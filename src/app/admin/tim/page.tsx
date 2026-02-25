
import { TeamManagement } from "@/components/admin/team-management";
import { Users } from "lucide-react";

export default function TeamManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Users className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Tim</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola anggota tim yang ditampilkan di halaman publik.
      </p>
      <div className="pt-4">
        <TeamManagement />
      </div>
    </div>
  );
}
