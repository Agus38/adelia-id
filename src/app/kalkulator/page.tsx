
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

export default function KalkulatorPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Kalkulator</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kalkulator</CardTitle>
          <CardDescription>Gunakan kalkulator untuk perhitungan cepat.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Halaman ini sedang dalam pengembangan. Segera hadir!</p>
        </CardContent>
      </Card>
    </div>
  );
}
