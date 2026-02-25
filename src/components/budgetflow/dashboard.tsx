
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import { SummaryCards } from './summary-cards';
import { ChartsView } from './charts-view';
import { AddTransactionButton } from './add-transaction-dialog';
import type { DateRange } from 'react-day-picker';

interface BudgetFlowDashboardProps {
    dateRange?: DateRange;
}

export function BudgetFlowDashboard({ dateRange }: BudgetFlowDashboardProps) {
  const { loading } = useBudgetflowStore();

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex-1 space-y-6">
        {loading ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <SummaryCards dateRange={dateRange} />
            <ChartsView dateRange={dateRange} />
          </div>
        )}
      </div>
    </div>
  );
}

    