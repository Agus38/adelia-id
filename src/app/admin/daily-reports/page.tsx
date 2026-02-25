
import { DailyReportManagement } from "@/components/admin/daily-report-management";
import { FileText } from "lucide-react";

export default function DailyReportManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Laporan Harian</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola semua laporan keuangan harian yang dikirimkan.
      </p>
      <div className="pt-4">
        <DailyReportManagement />
      </div>
    </div>
  );
}
