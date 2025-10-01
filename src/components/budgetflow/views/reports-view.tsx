
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudgetflowStore, expenseCategories } from '@/lib/budgetflow-store';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';


const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const chartConfig = {
  amount: {
    label: 'Pengeluaran',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


export function ReportsView() {
  const { transactions } = useBudgetflowStore();
  const [selectedMonth, setSelectedMonth] = React.useState(String(new Date().getMonth()));
  const [selectedYear, setSelectedYear] = React.useState(String(new Date().getFullYear()));

  const { years, months } = React.useMemo(() => {
    const yearsSet = new Set<string>();
    transactions.forEach(tx => {
      yearsSet.add(String(new Date(tx.date instanceof Date ? tx.date : tx.date.toDate()).getFullYear()));
    });
    const monthsList = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return {
      years: Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a)),
      months: monthsList,
    };
  }, [transactions]);

  const monthlyData = React.useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date instanceof Date ? tx.date : tx.date.toDate());
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const expensesByCategory: { [key: string]: number } = {};

    expenseCategories.forEach(cat => expensesByCategory[cat] = 0);

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
        if(expensesByCategory[tx.category] !== undefined) {
             expensesByCategory[tx.category] += tx.amount;
        } else {
             expensesByCategory['Lainnya'] += tx.amount;
        }
      }
    });
    
    const chartData = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { totalIncome, totalExpenses, netSavings: totalIncome - totalExpenses, chartData };
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Laporan Bulanan</CardTitle>
          <CardDescription>Pilih periode untuk melihat ringkasan keuangan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.length > 0 ? years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                )) : <SelectItem value={selectedYear} disabled>{selectedYear}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
             <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyData.totalIncome)}</div>
                </CardContent>
             </Card>
             <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyData.totalExpenses)}</div>
                </CardContent>
             </Card>
             <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Selisih (Net)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${monthlyData.netSavings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(monthlyData.netSavings)}</div>
                </CardContent>
             </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pengeluaran per Kategori</CardTitle>
           <CardDescription>
             Visualisasi pengeluaran untuk {months[parseInt(selectedMonth)]} {selectedYear}.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {monthlyData.chartData.length > 0 ? (
                 <ChartContainer config={chartConfig} className="w-full h-[400px]">
                    <BarChart data={monthlyData.chartData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={5} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Tidak ada data pengeluaran untuk periode ini.</p>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
