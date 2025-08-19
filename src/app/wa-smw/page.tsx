
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Send } from 'lucide-react';

export default function WaSmwPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Send className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">WA SMW</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>WA SMW</CardTitle>
          <CardDescription>Kirim pesan WhatsApp melalui SMW.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Halaman ini sedang dalam pengembangan. Segera hadir!</p>
        </CardContent>
      </Card>
    </div>
  );
}
