'use client';

import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useSessionManager } from '@/hooks/use-session-manager';
import { AppSidebar } from '@/components/layout/sidebar';
import { useUserStore } from '@/lib/user-store';

export type UserProfile = User & {
  id?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string;
  status?: 'Aktif' | 'Diblokir';
};

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { initializeUserListener } = useUserStore();

  useSessionManager();

  useEffect(() => {
    const unsubscribe = initializeUserListener();
    return () => unsubscribe();
  }, [initializeUserListener]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Header />
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
