
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

  // 1. If user is not logged in, redirect to the login page.
  if (!user) {
    redirect('/login');
  }

  // 2. If user is logged in, check their role.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 3. If there was an error, the profile doesn't exist, or the role is not 'Admin',
  //    redirect to the unauthorized page.
  if (error || !profile || profile.role !== 'Admin') {
    redirect('/unauthorized');
  }

  // 4. If the user is an Admin, allow access.
  return <>{children}</>;
}
