
import { SmwManyarReportForm } from "@/components/smw-manyar/report-form";
import { FileText } from 'lucide-react';

export default function SmwManyarPage() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8 space-y-4">
      <div className="flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8" />
          <h2 className="text-3xl font-bold tracking-tight">Laporan SMW Manyar</h2>
        </div>
        <p className="text-muted-foreground mt-2">
          Isi formulir di bawah untuk membuat laporan harian dan mengirimkannya via WhatsApp.
        </p>
      </div>
      <div className="flex-1 pt-4">
        <SmwManyarReportForm />
      </div>
    </div>
  );
}
