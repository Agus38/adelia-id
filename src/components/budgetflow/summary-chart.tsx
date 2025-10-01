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

const chartData = [
  { category: 'Makanan', value: 450, fill: 'var(--color-makanan)' },
  { category: 'Transportasi', value: 300, fill: 'var(--color-transportasi)' },
  { category: 'Tagihan', value: 200, fill: 'var(--color-tagihan)' },
  { category: 'Hiburan', value: 278, fill: 'var(--color-hiburan)' },
  { category: 'Lainnya', value: 189, fill: 'var(--color-lainnya)' },
];

const chartConfig = {
  value: {
    label: 'Value',
  },
  makanan: {
    label: 'Makanan',
    color: 'hsl(var(--chart-1))',
  },
  transportasi: {
    label: 'Transportasi',
    color: 'hsl(var(--chart-2))',
  },
  tagihan: {
    label: 'Tagihan',
    color: 'hsl(var(--chart-3))',
  },
  hiburan: {
    label: 'Hiburan',
    color: 'hsl(var(--chart-4))',
  },
  lainnya: {
    label: 'Lainnya',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function SummaryChart() {
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
          labelLine={false}
        >
           {chartData.map((entry, index) => (
             <Cell
              key={`cell-${index}`}
              fill={entry.fill}
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
