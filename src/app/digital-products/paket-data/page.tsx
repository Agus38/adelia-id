
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function PaketDataPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Wallet className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Beli Paket Data</h2>
      </div>
      <p className="text-muted-foreground">
        Halaman ini sedang dalam pengembangan. Segera hadir!
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaksi Paket Data</CardTitle>
          <CardDescription>
            Formulir untuk membeli paket data akan tersedia di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for the transaction form */}
        </CardContent>
      </Card>
    </div>
  );
}
