'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { RecentTransactionsTable } from "./recent-transactions-table";
import { SummaryChart } from "./summary-chart";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

export function BudgetFlowDashboard() {
  const summaryData = {
    balance: 5231890,
    income: 8500000,
    expenses: 3268110,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryData.balance)}</div>
            <p className="text-xs text-muted-foreground">Total saldo yang Anda miliki</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan (Bulan Ini)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(summaryData.income)}</div>
             <p className="text-xs text-muted-foreground">+15.2% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran (Bulan Ini)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(summaryData.expenses)}</div>
             <p className="text-xs text-muted-foreground">+8.1% dari bulan lalu</p>
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
            <CardDescription>Distribusi pengeluaran Anda bulan ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
