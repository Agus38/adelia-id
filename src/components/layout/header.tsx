
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import { Logo } from '../icons';
import Link from 'next/link';
import { useBrandingConfig } from '@/lib/menu-store';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { useUserStore } from '@/lib/user-store';

export function Header() {
  const { user } = useUserStore();
  const { brandingConfig, isLoading: isBrandingLoading } = useBrandingConfig();
  const { appName, logoType, icon: AppIcon = Logo, imageUrl } = brandingConfig;

  const renderLogo = () => {
    if (isBrandingLoading) {
      return (
        <>
          <Skeleton className="h-6 w-6 rounded-sm" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </>
      );
    }

    const LogoComponent = AppIcon || Logo;

    return (
      <>
        {logoType === 'icon' ? (
          <LogoComponent />
        ) : (
          imageUrl && <Image src={imageUrl} alt={`${appName} Logo`} width={28} height={28} className="h-7 w-7 object-contain" />
        )}
        <span className="text-primary text-lg">{appName}</span>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
         <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
            {renderLogo()}
          </Link>
      </div>
      
      {/* Centered Logo for Mobile */}
      <div className="flex-1 flex justify-center md:hidden">
         <Link href="/" className="items-center gap-2 font-semibold flex">
            {renderLogo()}
          </Link>
      </div>

      <div className="flex items-center gap-4 md:flex-1 md:justify-end">
        {user && <ThemeToggle />}
        <UserNav />
      </div>
    </header>
  );
}
