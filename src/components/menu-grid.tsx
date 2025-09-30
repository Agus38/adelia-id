
'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { useMenuConfig } from "@/lib/menu-store";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/user-store";

export function MenuGrid() {
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const { user, loading: isLoadingUser } = useUserStore();

  const filteredMenuItems = menuItems.filter(item => {
    // Admin sees everything.
    if (user?.role === 'Admin') {
      return true;
    }
    
    // Non-admins only see 'all' access items
    return item.access !== 'admin';
  });

  if (isLoadingMenu || isLoadingUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
      {filteredMenuItems.map((item) => {
        const isClickDisabled = item.comingSoon;
        let href = item.href;

        if (item.isUnderMaintenance) {
          href = '/maintenance';
        } else if (item.requiresAuth && !user) {
          href = '/login';
        } else if (isClickDisabled) {
          href = '#'; // Prevent navigation for coming soon items
        }
        
        return (
            <Link href={href} key={item.id} className={cn(isClickDisabled && "pointer-events-none")}>
              <Card className="bg-background transition-all duration-200 aspect-square flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl relative shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1f1f1f,-8px_-8px_16px_#2d2d2d] active:shadow-[inset_8px_8px_16px_#d1d1d1,inset_-8px_-8px_16px_#ffffff] dark:active:shadow-[inset_8px_8px_16px_#1f1f1f,inset_-8px_-8px_16px_#2d2d2d] hover:text-primary">
                <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                  <div className="p-3 bg-background rounded-full shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#2d2d2d]">
                    <item.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <p className="text-[11px] leading-tight sm:text-sm text-center font-semibold">
                    {item.title}
                  </p>
                  {item.isUnderMaintenance && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
                      {item.badgeText || 'Maintenance'}
                    </Badge>
                  )}
                   {item.comingSoon && !item.isUnderMaintenance && (
                     <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
                       {item.badgeText || 'Segera'}
                    </Badge>
                   )}
                </CardContent>
              </Card>
            </Link>
        )
      })}
    </div>
  );
}
