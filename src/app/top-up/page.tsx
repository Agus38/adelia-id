
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function TopUpPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center space-x-2">
        <Wallet className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Top Up Saldo</h2>
      </div>
       <p className="text-muted-foreground">
        Pilih metode pembayaran dan nominal untuk menambah saldo Anda.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Formulir Top Up</CardTitle>
          <CardDescription>
            Fitur ini sedang dalam pengembangan. Segera hadir!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for the top up form */}
        </CardContent>
      </Card>
    </div>
  );
}
