
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Shield, Globe, Lock } from 'lucide-react';
import { menuItems, adminMenuItems, allMenuItems } from '@/lib/menu-items-v2';
import type { MenuItem } from '@/lib/menu-items-v2';

const AccessBadge = ({ access }: { access: 'admin' | 'all' | undefined }) => {
  if (access === 'admin') {
    return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1.5" /> Admin</Badge>;
  }
  return <Badge variant="secondary"><Globe className="h-3 w-3 mr-1.5" /> Semua</Badge>;
};

const AuthBadge = ({ requiresAuth }: { requiresAuth: boolean | undefined }) => {
  if (requiresAuth) {
    return <Badge variant="default"><Lock className="h-3 w-3 mr-1.5" /> Ya</Badge>;
  }
  return <Badge variant="outline">Tidak</Badge>;
}

export default function RoutesListPage() {
  const allRoutes: MenuItem[] = [...menuItems, ...adminMenuItems, ...allMenuItems];
  
  const uniqueRoutes = allRoutes.reduce((acc, current) => {
    if (!acc.find(item => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as MenuItem[]).sort((a,b) => a.href.localeCompare(b.href));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <LinkIcon className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Daftar Rute Aplikasi</h2>
      </div>
      <p className="text-muted-foreground">
        Daftar lengkap semua path halaman yang tersedia di aplikasi beserta deskripsi dan hak aksesnya.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Tabel Rute</CardTitle>
          <CardDescription>
            Gunakan tabel ini untuk referensi cepat mengenai struktur navigasi aplikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Path</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Hak Akses</TableHead>
                  <TableHead>Wajib Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueRoutes.map(route => (
                  <TableRow key={route.id}>
                    <TableCell className="font-mono text-xs">{route.href}</TableCell>
                    <TableCell className="font-medium">{route.title}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{route.description || '-'}</TableCell>
                    <TableCell><AccessBadge access={route.access} /></TableCell>
                    <TableCell><AuthBadge requiresAuth={route.requiresAuth} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
