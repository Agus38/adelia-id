import { MenuManagement } from "@/components/admin/menu-management";
import { LayoutGrid } from "lucide-react";

export default function MenuManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <LayoutGrid className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Menu</h2>
      </div>
       <p className="text-muted-foreground">
        Sesuaikan item menu aplikasi, ikon, dan visibilitasnya.
      </p>
       <div className="pt-4">
        <MenuManagement />
      </div>
    </div>
  );
}
