
'use client';

import { BudgetFlowDashboard } from "@/components/budgetflow/dashboard";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2 } from "lucide-react";

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

  return <BudgetFlowDashboard />;
}
