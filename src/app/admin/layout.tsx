
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/user-store';
import { Loader2 } from 'lucide-react';
import UnauthorizedPage from '../unauthorized/page';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUserStore();

  React.useEffect(() => {
    // This effect will run whenever `loading` or `user` changes.
    if (!loading) {
      if (!user || user.role !== 'Admin') {
        // If loading is complete and the user is not an admin, redirect them.
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router]);

  // While loading, or if the user is not yet confirmed as an admin, show a loading screen.
  // This prevents a flash of admin content to non-admin users.
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is finished and the user is confirmed as an admin, render the children.
  return <>{children}</>;
}
