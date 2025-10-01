'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export function TransactionsView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign />
          Semua Transaksi
        </CardTitle>
        <CardDescription>
          Lihat, cari, dan kelola semua transaksi pemasukan dan pengeluaran Anda.
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
