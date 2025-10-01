
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserStore } from "@/lib/user-store";
import { Skeleton } from "@/components/ui/skeleton";

export function UserBalanceCard() {
  const { user, loading } = useUserStore();
  const [greeting, setGreeting] = useState('');
  
  // Hardcoded balance for now
  const balance = 123456;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Selamat Pagi,');
    } else if (hour < 18) {
      setGreeting('Selamat Siang,');
    } else {
      setGreeting('Selamat Malam,');
    }
  }, []);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(value);

  const getAvatarFallback = (name?: string) => {
    if (!name) return <UserIcon />;
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
      return (
          <Card className="w-full max-w-lg mb-6">
              <CardContent className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                       <Skeleton className="h-12 w-12 rounded-full" />
                       <div className="space-y-2">
                           <Skeleton className="h-4 w-[100px]" />
                           <Skeleton className="h-4 w-[150px]" />
                           <Skeleton className="h-4 w-[80px]" />
                       </div>
                   </div>
                    <Skeleton className="h-10 w-24" />
              </CardContent>
          </Card>
      )
  }
  
  if (!user) {
      return null; // Don't show the card if the user is not logged in
  }

  return (
    <Card className="w-full max-w-lg mb-6">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl || user.photoURL || undefined} alt={user.fullName || "User Avatar"} data-ai-hint="user avatar" />
            <AvatarFallback>{getAvatarFallback(user.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <p className="font-semibold text-base">{user.fullName || 'Pengguna'}</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(balance)}</p>
          </div>
        </div>
        <Button asChild variant="outline">
            <Link href="/top-up">
                <PlusCircle className="mr-2 h-4 w-4" />
                Top Up
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
