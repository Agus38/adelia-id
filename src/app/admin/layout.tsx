
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
    // Wait until loading is complete before checking for role.
    if (!loading) {
      if (!user || user.role !== 'Admin') {
        // If user is not an admin, redirect them to the unauthorized page.
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router]);
  
  // While loading, or if the user is not yet confirmed as an admin, show a loading screen.
  // This prevents a flash of the unauthorized page or admin content.
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is finished and the user is an admin, render the children.
  return <>{children}</>;
}
