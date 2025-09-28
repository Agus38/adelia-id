
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
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Wait until the user loading process is complete
    if (loading) {
      return;
    }

    // If loading is done and there's no user, or user is not an Admin
    if (!user || user.role !== 'Admin') {
      router.push('/unauthorized');
    } else {
      // If user is an Admin, grant access
      setIsAuthorized(true);
    }
  }, [user, loading, router]);


  // While checking authorization, show a loading spinner
  if (isAuthorized === null || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If authorized, render the admin page content
  if (isAuthorized) {
    return <>{children}</>;
  }

  // This return is for the case where the redirect is happening, preventing any flash of content.
  return null;
}
