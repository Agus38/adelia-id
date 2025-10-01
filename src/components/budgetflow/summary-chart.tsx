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
  { category: 'Makanan', value: 450, fill: 'hsl(var(--chart-1))' },
  { category: 'Transportasi', value: 300, fill: 'hsl(var(--chart-2))' },
  { category: 'Tagihan', value: 200, fill: 'hsl(var(--chart-3))' },
  { category: 'Hiburan', value: 278, fill: 'hsl(var(--chart-4))' },
  { category: 'Lainnya', value: 189, fill: 'hsl(var(--chart-5))' },
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
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
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
        >
           {chartData.map((entry, index) => (
             <Cell
              key={`cell-${index}`}
              fill={entry.fill}
              className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
