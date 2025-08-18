import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Bantuan &amp; Dukungan</CardTitle>
          <CardDescription>Hubungi dukungan atau lihat FAQ.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Halaman ini sedang dalam pengembangan. Segera hadir!</p>
        </CardContent>
      </Card>
    </div>
  );
}
