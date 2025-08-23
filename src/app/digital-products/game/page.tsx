
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

export default function GamePage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Gamepad2 className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Top Up Game</h2>
      </div>
      <p className="text-muted-foreground">
        Halaman ini sedang dalam pengembangan. Segera hadir!
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaksi Top Up Game</CardTitle>
          <CardDescription>
            Formulir untuk top up game akan tersedia di sini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for the transaction form */}
        </CardContent>
      </Card>
    </div>
  );
}
