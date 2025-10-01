'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export function BudgetsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target />
          Anggaran
        </CardTitle>
        <CardDescription>
          Buat dan lacak anggaran bulanan Anda untuk setiap kategori pengeluaran.
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
