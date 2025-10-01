'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export function ReportsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart />
          Laporan Keuangan
        </CardTitle>
        <CardDescription>
          Hasilkan laporan keuangan bulanan, tahunan, atau rentang waktu kustom.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Fitur ini sedang dalam pengembangan.</p>
          <p className="text-sm text-muted-foreground">Segera hadir!</p>
        </div>
      </CardContent>
    </Card>
  )
}
