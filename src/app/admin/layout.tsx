
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // 1. If user is not logged in, redirect to the login page.
        router.push('/login');
        return;
      }

      // 2. If user is logged in, check their role.
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'Admin') {
        // 4. If the user is an Admin, allow access.
        setIsAuthorized(true);
      } else {
        // 3. If the role is not 'Admin', redirect to the unauthorized page.
        router.push('/unauthorized');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAuthorized === null) {
    // Show a loading state while checking authorization
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
