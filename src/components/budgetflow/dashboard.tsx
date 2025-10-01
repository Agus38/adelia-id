
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { RecentTransactionsTable } from "./recent-transactions-table";
import { SummaryChart } from "./summary-chart";
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export function BudgetFlowDashboard() {
  const { transactions, loading } = useBudgetflowStore();

  const summary = React.useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let balance = 0;

    transactions.forEach(tx => {
      balance += tx.type === 'income' ? tx.amount : -tx.amount;
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      if (txDate >= startOfMonth) {
        if (tx.type === 'income') {
          totalIncome += tx.amount;
        } else {
          totalExpenses += tx.amount;
        }
      }
    });

    return { balance, totalIncome, totalExpenses };
  }, [transactions]);
  
  if (loading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
            <p className="text-xs text-muted-foreground">Total saldo yang Anda miliki</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan ({format(new Date(), 'MMMM')})</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(summary.totalIncome)}</div>
             <p className="text-xs text-muted-foreground">Pemasukan bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran ({format(new Date(), 'MMMM')})</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(summary.totalExpenses)}</div>
             <p className="text-xs text-muted-foreground">Pengeluaran bulan ini</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>Daftar 5 transaksi terakhir Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ringkasan Pengeluaran</CardTitle>
            <CardDescription>Distribusi pengeluaran bulan ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
