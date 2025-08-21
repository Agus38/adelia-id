
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SmwManyarManagement() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Halaman SMW Manyar</CardTitle>
        <CardDescription>
          Sesuaikan item dan opsi yang tersedia di formulir laporan SMW Manyar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Fitur sedang dalam pengembangan.</p>
        </div>
      </CardContent>
    </Card>
  );
}
