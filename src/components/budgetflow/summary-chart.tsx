
'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useBudgetflowStore, expenseCategories } from '@/lib/budgetflow-store';
import { PackageOpen } from 'lucide-react';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.7)',
  'hsl(var(--chart-2) / 0.7)',
  'hsl(var(--chart-3) / 0.7)',
  'hsl(var(--chart-4) / 0.7)',
  'hsl(var(--chart-5) / 0.7)',
];

// Pre-define chart config for all possible expense categories
const chartConfig = expenseCategories.reduce((config, category, index) => {
  config[category] = {
    label: category,
    color: chartColors[index % chartColors.length],
  };
  return config;
}, {} as ChartConfig);


export function SummaryChart() {
  const { transactions } = useBudgetflowStore();

  const chartData = React.useMemo(() => {
    const monthlyExpenses: { [key: string]: number } = {};
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    transactions.forEach(tx => {
      const txDate = tx.date instanceof Date ? tx.date : tx.date.toDate();
      if (tx.type === 'expense' && txDate >= startOfMonth) {
        monthlyExpenses[tx.category] = (monthlyExpenses[tx.category] || 0) + tx.amount;
      }
    });

    const data = Object.entries(monthlyExpenses)
      .map(([category, value]) => ({ category, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return data;
  }, [transactions]);


  if (chartData.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full aspect-square text-center text-muted-foreground p-4">
            <PackageOpen className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">Belum Ada Data Pengeluaran</p>
            <p className="text-xs">Catat pengeluaran bulan ini untuk melihat ringkasannya di sini.</p>
        </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel 
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)}
          />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
           {chartData.map((entry, index) => (
             <Cell
              key={`cell-${index}`}
              fill={chartConfig[entry.category]?.color || chartColors[index % chartColors.length]}
              className="focus:outline-none"
            />
          ))}
        </Pie>
         <ChartLegend
            content={<ChartLegendContent nameKey="category" />}
            className="-mt-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
      </PieChart>
    </ChartContainer>
  );
}
