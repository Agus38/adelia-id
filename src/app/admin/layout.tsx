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
    if (loading) {
      return;
    }

    if (!user) {
      router.push('/login');
    } else if (user.role !== 'Admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  // While loading or if user is not an admin (before redirect finishes), show loading.
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is logged in and is an Admin, show the admin content.
  return <>{children}</>;
}
