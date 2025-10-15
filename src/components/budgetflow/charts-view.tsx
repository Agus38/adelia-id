
'use client';

import * as React from 'react';
import { Bar, BarChart, Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useBudgetflowStore } from '@/lib/budgetflow-store';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PackageOpen } from 'lucide-react';
import { endOfDay } from 'date-fns';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

interface ChartsViewProps {
    dateRange?: DateRange;
}

export function ChartsView({ dateRange }: ChartsViewProps) {
  const { transactions, expenseCategories } = useBudgetflowStore();

  const { chartConfig, pieChartData, barChartData } = React.useMemo(() => {
    const { from, to } = dateRange || {};

    const filteredTransactions = transactions.filter(tx => {
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      const endDate = to ? endOfDay(to) : undefined;
      if (from && endDate) return txDate >= from && txDate <= endDate;
      if (from) return txDate >= from;
      if (endDate) return txDate <= endDate;
      return true;
    });

    const expensesByCategory: { [key: string]: number } = {};
    const monthlySummary: { [month: string]: { income: number, expense: number } } = {};

    filteredTransactions.forEach(tx => {
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { income: 0, expense: 0 };
      }

      if (tx.type === 'expense') {
        expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
        monthlySummary[monthKey].expense += tx.amount;
      } else {
        monthlySummary[monthKey].income += tx.amount;
      }
    });

    const newChartConfig = expenseCategories.reduce((config, category, index) => {
      config[category.value] = {
        label: category.label,
        color: chartColors[index % chartColors.length],
      };
      return config;
    }, {} as ChartConfig);

    const newPieChartData = Object.entries(expensesByCategory)
      .map(([category, value]) => ({ category, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const newBarChartData = Object.entries(monthlySummary).map(([month, data]) => ({
      month,
      ...data,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return { chartConfig: newChartConfig, pieChartData: newPieChartData, barChartData: newBarChartData };
  }, [transactions, expenseCategories, dateRange]);

  const NoDataPlaceholder = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center text-muted-foreground p-4">
        <PackageOpen className="h-10 w-10 mb-2" />
        <p className="text-sm font-medium">Belum Ada Data</p>
        <p className="text-xs">{message}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Komposisi Pengeluaran</CardTitle>
          <CardDescription>Berdasarkan rentang waktu yang dipilih.</CardDescription>
        </CardHeader>
        <CardContent>
          {pieChartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel 
                    formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)}
                  />}
                />
                <Pie data={pieChartData} dataKey="value" nameKey="category" innerRadius={60} strokeWidth={5}>
                   {pieChartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={chartConfig[entry.category]?.color} className="focus:outline-none" />
                  ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="category" />} className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
              </PieChart>
            </ChartContainer>
          ) : (
            <NoDataPlaceholder message="Tidak ada data pengeluaran pada periode ini."/>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Ringkasan Bulanan</CardTitle>
          <CardDescription>Pemasukan vs. Pengeluaran per bulan.</CardDescription>
        </CardHeader>
        <CardContent>
           {barChartData.length > 0 ? (
                <ChartContainer config={{
                    income: { label: "Pemasukan", color: "hsl(var(--chart-2))" },
                    expense: { label: "Pengeluaran", color: "hsl(var(--chart-1))" },
                }} className="h-[300px] w-full">
                <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value + '-02').toLocaleDateString('id-ID', { month: 'short' })} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                    <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                </BarChart>
              </ChartContainer>
           ) : (
             <NoDataPlaceholder message="Tidak ada transaksi pada periode ini."/>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
