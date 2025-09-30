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
    // Jangan lakukan apa-apa sampai data selesai dimuat.
    if (loading) {
      return;
    }

    // Setelah data dimuat, periksa apakah pengguna ada dan merupakan Admin.
    // Jika tidak, alihkan mereka.
    if (!user || user.role !== 'Admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);


  // Selama loading, atau jika pengguna bukan admin (sebelum pengalihan terjadi),
  // tampilkan layar pemuatan untuk mencegah konten admin berkedip.
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika loading selesai dan pengguna adalah Admin, render konten admin.
  return <>{children}</>;
}
