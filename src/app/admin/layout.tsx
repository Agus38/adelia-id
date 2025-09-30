'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/user-store';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUserStore();

  React.useEffect(() => {
    // Tunggu hingga data selesai dimuat
    if (loading) {
      return;
    }

    // Jika tidak ada pengguna yang login sama sekali, alihkan ke halaman login
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  // Tampilkan layar pemuatan selama data dimuat atau sebelum pengalihan terjadi
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika sudah login (peran apa pun), izinkan akses
  return <>{children}</>;
}
