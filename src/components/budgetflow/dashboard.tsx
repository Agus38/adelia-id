
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, BarChart2, Table } from 'lucide-react';
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import { SummaryCards } from './summary-cards';
import { ChartsView } from './charts-view';
import { DataTable } from './data-table';
import { AddTransactionButton } from './add-transaction-dialog';
import { DateRangePicker } from './date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export function BudgetFlowDashboard() {
  const { loading } = useBudgetflowStore();
  const [viewMode, setViewMode] = React.useState<'chart' | 'table'>('chart');
  
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

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
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
           <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
             <div className="flex items-center gap-2">
                <Button variant={viewMode === 'chart' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('chart')} className="flex-1">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Grafik
                </Button>
                <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')} className="flex-1">
                    <Table className="mr-2 h-4 w-4" />
                    Tabel
                </Button>
             </div>
              <DateRangePicker date={date} setDate={setDate} presetRanges={presetRanges} />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <SummaryCards dateRange={date} />
            
            {viewMode === 'chart' ? (
                <ChartsView dateRange={date} />
            ) : (
                <DataTable dateRange={date} />
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <AddTransactionButton />
      </div>
    </div>
  );
}
