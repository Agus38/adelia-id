'use client';

import { BudgetFlowDashboard } from "@/components/budgetflow/dashboard";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2, TrendingUp } from "lucide-react";

export default function BudgetFlowPage() {
  const { hasAccess, isLoading } = usePageAccess('budgetflow');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null; // The hook handles redirection.
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <TrendingUp className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">BudgetFlow</h2>
      </div>
       <p className="text-muted-foreground">
        Dasbor Anda untuk melacak pemasukan, pengeluaran, dan mengelola anggaran.
      </p>
      <div className="pt-2">
        <BudgetFlowDashboard />
      </div>
    </div>
  );
}
