
'use client';

import { useBrandingConfig } from "@/lib/menu-store";
import { Skeleton } from "../ui/skeleton";

export function Footer() {
  const { brandingConfig, isLoading } = useBrandingConfig();

  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-4 w-1/2" />
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            {brandingConfig.footerText || `© ${new Date().getFullYear()} ${brandingConfig.appName}`}
          </p>
        )}
      </div>
    </footer>
  );
}
