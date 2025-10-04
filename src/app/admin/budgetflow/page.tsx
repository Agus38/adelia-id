
import { BudgetFlowManagement } from "@/components/admin/budgetflow-management";
import { TrendingUp } from "lucide-react";

export default function AdminBudgetFlowPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Manajemen BudgetFlow</h2>
      </div>
      <p className="text-muted-foreground">
        Lihat dan kelola data keuangan (BudgetFlow) dari semua pengguna.
      </p>
      <div className="pt-4">
        <BudgetFlowManagement />
      </div>
    </div>
  );
}
