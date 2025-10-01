
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import type { DateRange } from 'react-day-picker';

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

    const filteredTransactions = transactions.filter(tx => {
        if (!from && !to) return true;
        const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
        if (from && to) return txDate >= from && txDate <= to;
        if (from) return txDate >= from;
        if (to) return txDate <= to;
        return true;
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    });

    const balance = transactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

    return { balance, totalIncome, totalExpenses };
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
          <p className="text-xs text-muted-foreground">Dalam rentang waktu yang dipilih</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Dalam rentang waktu yang dipilih</p>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
          <p className="text-xs text-muted-foreground">Total saldo dari semua transaksi</p>
        </CardContent>
      </Card>
    </div>
  );
}
