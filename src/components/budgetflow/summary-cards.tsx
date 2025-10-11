
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import type { DateRange } from 'react-day-picker';
import { endOfDay } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

interface SummaryCardsProps {
    dateRange?: DateRange;
}

export function SummaryCards({ dateRange }: SummaryCardsProps) {
  const { transactions } = useBudgetflowStore();

  const summary = React.useMemo(() => {
    const { from, to } = dateRange || {};
    const endDate = to ? endOfDay(to) : undefined;

    const filteredTransactions = transactions.filter(tx => {
      if (!from && !endDate) return true;
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      if (from && endDate) return txDate >= from && txDate <= endDate;
      if (from) return txDate >= from;
      if (endDate) return txDate <= endDate;
      return true;
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach(tx => {
      // Exclude savings-related transactions from income/expense totals
      if (tx.category !== 'Tabungan' && tx.category !== 'Dari Tabungan') {
          if (tx.type === 'income') {
            totalIncome += tx.amount;
          } else {
            totalExpenses += tx.amount;
          }
      }
    });

    // Calculate available balance by considering all transactions
    const availableBalance = transactions.reduce((acc, tx) => {
        if (tx.type === 'income') {
            return acc + tx.amount;
        } else {
            return acc - tx.amount;
        }
    }, 0);

    return { availableBalance, totalIncome, totalExpenses };
  }, [transactions, dateRange]);
  

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(summary.totalIncome)}</div>
          <p className="text-xs text-muted-foreground">Dalam rentang waktu yang dipilih (tidak termasuk tabungan)</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Dalam rentang waktu yang dipilih (tidak termasuk tabungan)</p>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Tersedia</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.availableBalance)}</div>
          <p className="text-xs text-muted-foreground">Total saldo kas Anda saat ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
