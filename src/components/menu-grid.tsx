
'use client';

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { useMenuConfig } from "@/lib/menu-store";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/app/main-layout";
import { cn } from "@/lib/utils";

export function MenuGrid() {
  const { menuItems, isLoading: isLoadingMenu } = useMenuConfig();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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
          });
        } else {
           setUser(authUser);
        }
      } else {
        setUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

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
              <Card className="hover:bg-primary/20 transition-colors duration-200 aspect-square flex flex-col items-center justify-center p-2 sm:p-4 border-2 border-transparent hover:border-primary/50 dark:border-gray-800 dark:hover:border-primary/70 shadow-lg rounded-2xl relative">
                <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <p className="text-[11px] leading-tight sm:text-sm text-center font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.isUnderMaintenance && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
                      {item.badgeText || 'Maintenance'}
                    </Badge>
                  )}
                   {item.comingSoon && !item.isUnderMaintenance && (
                     <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5">
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
