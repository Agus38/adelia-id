
import { SmwManyarManagement } from "@/components/admin/smw-manyar-management";
import { FileText } from "lucide-react";

export default function SmwManyarManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen SMW Manyar</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola item dan pengaturan untuk halaman laporan SMW Manyar.
      </p>
      <div className="pt-4">
        <SmwManyarManagement />
      </div>
    </div>
  );
}
