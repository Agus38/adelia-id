import { UserManagement } from "@/components/admin/user-management";

export default function UserManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
      </div>
      <UserManagement />
    </div>
  );
}
