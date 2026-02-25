
import { TermsSettings } from "@/components/admin/terms-settings";
import { FileText } from "lucide-react";

export default function AdminTermsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Syarat & Ketentuan</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola dan perbarui isi dari halaman Syarat & Ketentuan aplikasi Anda.
      </p>
      <div className="pt-4">
        <TermsSettings />
      </div>
    </div>
  );
}
