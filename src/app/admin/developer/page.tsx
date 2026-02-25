
import { DeveloperSettings } from "@/components/admin/developer-settings";
import { Code } from "lucide-react";

export default function AdminDeveloperPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Code className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Developer</h2>
      </div>
      <p className="text-muted-foreground">
        Kelola informasi yang ditampilkan pada halaman Developer.
      </p>
      <div className="pt-4">
        <DeveloperSettings />
      </div>
    </div>
  );
}
