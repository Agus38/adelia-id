
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from './main-layout';

export const metadata: Metadata = {
  title: 'Adelia-ID',
  description: 'Aplikasi web Adelia-ID',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <MainLayout>{children}</MainLayout>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
