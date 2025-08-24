
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

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch profile when user is logged in
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id);
          
          if (error) {
            console.error('Error fetching profile:', error.message);
            setUser(session.user); // Fallback to auth user
          } else if (profile && profile.length > 0) {
            setUser({ ...session.user, ...profile[0] });
          } else {
             // Profile not found, but no error. Fallback to auth user.
             // This can happen if the profile creation via trigger is delayed.
             setUser(session.user);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Initial check for user session
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
       if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id);
            
          if (profile && profile.length > 0) {
            setUser({ ...user, ...profile[0] });
          } else {
            setUser(user);
          }
       }
    };
    checkUser();

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

    