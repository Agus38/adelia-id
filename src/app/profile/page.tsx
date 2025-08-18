import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Kelola detail profil pribadi Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Halaman ini sedang dalam pengembangan. Segera hadir!</p>
        </CardContent>
      </Card>
    </div>
  );
}
