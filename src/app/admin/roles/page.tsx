
'use client';

import { RoleManagement } from "@/components/admin/role-management";
import { Shield } from "lucide-react";

export default function RoleManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Peran</h2>
      </div>
       <p className="text-muted-foreground">
        Tambah, edit, atau hapus peran pengguna untuk mengelola hak akses di seluruh aplikasi.
      </p>
       <div className="pt-4">
        <RoleManagement />
      </div>
    </div>
  );
}
