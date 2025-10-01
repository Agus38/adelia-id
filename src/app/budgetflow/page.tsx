
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChart2, Table, PiggyBank, Scale, Landmark } from 'lucide-react';
import { usePageAccess } from "@/hooks/use-page-access";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetFlowDashboard } from '@/components/budgetflow/dashboard';
import { DataTable } from '@/components/budgetflow/data-table';
import { BudgetsView } from '@/components/budgetflow/budgets-view';
import { SavingsView } from '@/components/budgetflow/savings-view';
import { DebtsView } from '@/components/budgetflow/debts-view';
import { DateRangePicker } from '@/components/budgetflow/date-range-picker';
import { type DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export default function BudgetFlowPage() {
  const { hasAccess, isLoading } = usePageAccess('budgetflow');
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const presetRanges = [
    { label: 'Bulan Ini', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: '7 Hari Terakhir', range: { from: subDays(new Date(), 6), to: new Date() } },
    { label: '30 Hari Terakhir', range: { from: subDays(new Date(), 29), to: new Date() } },
    { label: 'Tahun Ini', range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
  ];

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
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                BudgetFlow
              </h2>
              <p className="text-sm text-muted-foreground">
                Dasbor keuangan pribadi Anda.
              </p>
            </div>
          </div>
           <DateRangePicker date={date} setDate={setDate} presetRanges={presetRanges} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="dashboard"><BarChart2 className="w-4 h-4 mr-2"/>Dasbor</TabsTrigger>
            <TabsTrigger value="transactions"><Table className="w-4 h-4 mr-2"/>Transaksi</TabsTrigger>
            <TabsTrigger value="savings"><PiggyBank className="w-4 h-4 mr-2"/>Tabungan</TabsTrigger>
            <TabsTrigger value="debts"><Scale className="w-4 h-4 mr-2"/>Hutang/Piutang</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 overflow-x-auto">
             <TabsContent value="dashboard">
                <BudgetFlowDashboard dateRange={date}/>
            </TabsContent>
            <TabsContent value="transactions">
                <DataTable dateRange={date} />
            </TabsContent>
            <TabsContent value="savings">
                <SavingsView />
            </TabsContent>
             <TabsContent value="debts">
                <DebtsView />
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
