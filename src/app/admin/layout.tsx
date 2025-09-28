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
    // This effect runs whenever loading or user state changes.
    // If loading is finished, we make a decision.
    if (!loading) {
      if (!user || user.role !== 'Admin') {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router]);

  // While checking authorization, show a loading spinner.
  // This is the crucial part: we do not render children until loading is false AND the user is verified.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If loading is complete and we have a user with the Admin role, render the admin page content.
  // The useEffect above will handle redirection for unauthorized users.
  if (user && user.role === 'Admin') {
    return <>{children}</>;
  }

  // In the brief moment between the user state being non-admin and the redirect effect kicking in,
  // or if the user data is somehow invalid, render a loading screen to prevent any flash of content.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
