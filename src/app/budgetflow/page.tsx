'use client';

import { BudgetFlowDashboard } from "@/components/budgetflow/dashboard";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsView } from "@/components/budgetflow/views/transactions-view";
import { BudgetsView } from "@/components/budgetflow/views/budgets-view";
import { ReportsView } from "@/components/budgetflow/views/reports-view";
import { AddTransactionDialog } from "@/components/budgetflow/add-transaction-dialog";


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
      <Tabs defaultValue="dashboard" className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8" />
              <div>
                <h2 className="text-3xl font-bold tracking-tight">BudgetFlow</h2>
                <p className="text-muted-foreground text-sm">
                  Dasbor Anda untuk melacak keuangan.
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <AddTransactionDialog />
            </div>
        </div>
        <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="dashboard">Dasbor</TabsTrigger>
              <TabsTrigger value="transactions">Transaksi</TabsTrigger>
              <TabsTrigger value="budgets">Anggaran</TabsTrigger>
              <TabsTrigger value="reports">Laporan</TabsTrigger>
            </TabsList>
            <div className="block md:hidden">
               <AddTransactionDialog />
            </div>
        </div>
        
        <TabsContent value="dashboard" className="space-y-4">
          <BudgetFlowDashboard />
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <TransactionsView />
        </TabsContent>
        <TabsContent value="budgets" className="space-y-4">
          <BudgetsView />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
