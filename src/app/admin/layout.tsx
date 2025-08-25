
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
    // User is not logged in, redirect to login page.
    redirect('/login');
  }

  // User is logged in, check their role.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If there's an error, or if the profile doesn't exist, or if the role is not 'Admin',
  // redirect to a "not authorized" page.
  if (error || !profile || profile.role !== 'Admin') {
    redirect('/unauthorized');
  }

  // If the user is an Admin, render the admin page content.
  return <>{children}</>;
}
