
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/user-store';
import { Skeleton } from '@/components/ui/skeleton';

function AdminDashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Skeleton className="h-8 w-1/4" />
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-1 h-[400px]" />
          <Skeleton className="lg:col-span-2 h-[400px]" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useUserStore();

  React.useEffect(() => {
    if (!loading) {
        if (!user) {
          router.push('/login?redirect=/admin');
        } else if (user.role !== 'Admin') {
          router.push('/unauthorized');
        }
    }
  }, [user, loading, router]);

  // While loading, or if user is not an admin (before redirect finishes), show a skeleton.
  if (loading || !user || user.role !== 'Admin') {
    return <AdminDashboardSkeleton />;
  }

  // If user is logged in and is an Admin, show the admin content.
  return <>{children}</>;
}
