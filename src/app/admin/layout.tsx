
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

  // While loading, show a full-screen spinner.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // After loading, check for user and role.
  // If authorized, render the children.
  if (user && user.role === 'Admin') {
    return <>{children}</>;
  }

  // If not authorized, render the Unauthorized page content directly.
  // This prevents flickering and race conditions with router.push.
  return <UnauthorizedPage />;
}
