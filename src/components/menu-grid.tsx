
'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/menu-items-v2";
import { getMenuConfig } from "@/lib/menu-store";
import { Loader2 } from "lucide-react";

export function MenuGrid() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoading(true);
      const config = await getMenuConfig();
      setMenuItems(config);
      setIsLoading(false);
    }
    fetchMenus();
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-4 md:gap-6">
      {menuItems.map((item) => (
        <Link href={item.href} key={item.id} className={item.comingSoon ? "pointer-events-none" : ""}>
          <Card className="hover:bg-primary/20 transition-colors duration-200 aspect-square flex flex-col items-center justify-center p-2 sm:p-4 border-2 border-transparent hover:border-primary/50 dark:border-gray-800 dark:hover:border-primary/70 shadow-lg rounded-2xl relative">
            <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <p className="text-[11px] leading-tight sm:text-sm text-center font-semibold text-foreground">
                {item.title}
              </p>
               {item.comingSoon && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
                  Segera
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
