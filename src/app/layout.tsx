
'use client';

import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export type UserProfile = User & {
  full_name?: string;
  avatar_url?: string;
  role?: string;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (authUser: User) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      // Fallback to auth user metadata if profile fetch fails
      setUser({
        ...authUser,
        full_name: authUser.user_metadata.full_name,
        avatar_url: authUser.user_metadata.avatar_url,
      });
    } else if (profile) {
      // If profile exists, merge it with the auth user object
      setUser({ ...authUser, ...profile });
    } else {
       // Profile not found, but no error. Fallback to auth user metadata.
       setUser({
        ...authUser,
        full_name: authUser.user_metadata.full_name,
        avatar_url: authUser.user_metadata.avatar_url,
      });
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
    };
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        <title>Adelia-ID</title>
        <meta name="description" content="Aplikasi web Adelia-ID" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <AppSidebar />
              <div className="flex flex-1 flex-col">
                <Header user={user} />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
