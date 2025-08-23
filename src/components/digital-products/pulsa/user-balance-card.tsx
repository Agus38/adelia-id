
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export function UserBalanceCard() {
  const userInfo = {
    name: "Adelia",
    balance: 123456,
    avatarUrl: "https://placehold.co/100x100.png",
    avatarFallback: "A",
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(value);

  return (
    <Card className="w-full max-w-lg mb-6">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} data-ai-hint="user avatar" />
            <AvatarFallback>{userInfo.avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-base">{userInfo.name}</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(userInfo.balance)}</p>
          </div>
        </div>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Top Up
        </Button>
      </CardContent>
    </Card>
  );
}
