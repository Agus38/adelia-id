
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

  if (!user) {
    // Pengguna tidak login, alihkan ke halaman login
    redirect('/login');
  }

  // Ambil profil pengguna untuk memeriksa peran
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'Admin') {
    // Jika terjadi error, profil tidak ada, atau peran bukan Admin,
    // alihkan ke halaman utama.
    redirect('/');
  }

  // Jika pengguna adalah Admin, tampilkan konten halaman admin
  return <>{children}</>;
}
