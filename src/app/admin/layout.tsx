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
      return; // Do nothing while loading
    }
    if (!user || user.role !== 'Admin') {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);


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
