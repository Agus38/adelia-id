
import * as React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Jika pengguna tidak login, arahkan ke halaman login.
  if (!user) {
    redirect('/login');
  }

  // 2. Jika pengguna sudah login, periksa perannya.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 3. Jika terjadi error, profil tidak ada, atau peran bukan 'Admin',
  //    arahkan ke halaman akses ditolak.
  if (error || !profile || profile.role !== 'Admin') {
    redirect('/unauthorized');
  }

  // 4. Jika pengguna adalah Admin, izinkan akses.
  return <>{children}</>;
}
