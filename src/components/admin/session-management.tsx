
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { Laptop, Loader2, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

// NOTE: Supabase client-side library does not currently support fetching all user sessions.
// This is a mock implementation to demonstrate the UI.
const mockSessions = [
  {
    id: 1,
    user: 'Adelia',
    email: 'adelia@example.com',
    device: 'Chrome di Windows',
    location: 'Gresik, ID',
    ip: '103.24.12.10',
    lastAccessed: '2 menit yang lalu',
    isCurrent: true,
    icon: Laptop,
  },
  {
    id: 2,
    user: 'Budi',
    email: 'budi@example.com',
    device: 'Aplikasi Mobile Adelia',
    location: 'Surabaya, ID',
    ip: '121.55.44.20',
    lastAccessed: '1 jam yang lalu',
    isCurrent: false,
    icon: Smartphone,
  },
  {
    id: 3,
    user: 'Citra',
    email: 'citra@example.com',
    device: 'Firefox di Linux',
    location: 'Sidoarjo, ID',
    ip: '180.13.22.91',
    lastAccessed: '5 jam yang lalu',
    isCurrent: false,
    icon: Laptop,
  },
];

export function SessionManagement() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOutAll = async () => {
    setLoading(true);
    // In a real app, this would be a server-side call to invalidate all sessions for all users.
    // The client-side signOut only affects the current user.
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast({
        title: 'Error',
        description: 'Gagal keluar dari semua sesi: ' + error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Berhasil Keluar',
        description:
          'Anda telah berhasil keluar dari sesi Anda saat ini. (Simulasi untuk semua sesi)',
      });
      router.push('/login');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Sesi Aktif</CardTitle>
        <CardDescription>
          Berikut adalah daftar sesi aktif dari semua pengguna. Fitur ini masih
          dalam pengembangan dan menggunakan data simulasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Lokasi & IP</TableHead>
                <TableHead>Terakhir Aktif</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.user}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <session.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{session.device}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{session.location}</div>
                    <div className="text-xs text-muted-foreground font-mono">{session.ip}</div>
                  </TableCell>
                  <TableCell>{session.lastAccessed}</TableCell>
                   <TableCell>
                     {session.isCurrent ? (
                        <Badge variant="default">Sesi Ini</Badge>
                     ) : (
                        <Badge variant="secondary">Aktif</Badge>
                     )}
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button variant="destructive" onClick={handleSignOutAll} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Keluar dari Semua Sesi (Simulasi)
        </Button>
      </CardFooter>
    </Card>
  );
}
