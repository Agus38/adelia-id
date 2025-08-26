
import { AdminSidebarManagement } from "@/components/admin/admin-sidebar-management";
import { PanelLeft } from "lucide-react";

export default function AdminSidebarManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <PanelLeft className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Sidebar Admin</h2>
      </div>
       <p className="text-muted-foreground">
        Sesuaikan item menu yang ditampilkan di sidebar khusus untuk halaman admin.
      </p>
       <div className="pt-4">
        <AdminSidebarManagement />
      </div>
    </div>
  );
}
