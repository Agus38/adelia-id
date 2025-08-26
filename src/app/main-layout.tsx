
'use client';

import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useSessionManager } from '@/hooks/use-session-manager';

export type UserProfile = User & {
  fullName?: string;
  role?: string;
  avatarUrl?: string;
};

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session manager hook
  useSessionManager();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            ...authUser,
            fullName: userData.fullName || authUser.displayName,
            role: userData.role,
            avatarUrl: userData.avatarUrl || authUser.photoURL,
          });
        } else {
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Header user={user} loading={loading} />
          <main className="flex-1">{children}</main>
          <Footer />
      </div>
      <Toaster />
    </>
  );
}
