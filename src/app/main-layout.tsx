
'use client';

import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useSessionManager } from '@/hooks/use-session-manager';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/layout/sidebar';

export type UserProfile = User & {
  fullName?: string;
  role?: string;
  avatarUrl?: string;
  status?: 'Aktif' | 'Diblokir';
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

          // CRITICAL: Check if the user is blocked.
          if (userData.status === 'Diblokir') {
            toast({
              title: "Akses Ditolak",
              description: "Akun Anda telah diblokir. Silakan hubungi administrator.",
              variant: "destructive",
              duration: 5000,
            });
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }

          setUser({
            ...authUser,
            fullName: userData.fullName || authUser.displayName,
            role: userData.role,
            avatarUrl: userData.avatarUrl || authUser.photoURL,
            status: userData.status || 'Aktif',
          });
        } else {
          // User exists in Auth but not in Firestore.
          // This could be a new registration flow or an anomaly.
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
           <div className="flex flex-1">
             <AppSidebar />
             <main className="flex-1">{children}</main>
          </div>
          <Footer />
      </div>
      <Toaster />
    </>
  );
}
