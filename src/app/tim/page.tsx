

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2 } from 'lucide-react';
import { useTeamConfig } from '@/lib/menu-store';
import { Skeleton } from '@/components/ui/skeleton';


export default function TimPage() {
  const { teamMembers, isLoading } = useTeamConfig();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <Users className="h-10 w-10" />
        <h2 className="text-3xl font-bold tracking-tight">Tim Kami</h2>
        <p className="text-muted-foreground max-w-xl">
            Kenali orang-orang hebat di balik Adelia-ID. Kami adalah tim yang bersemangat dalam menciptakan solusi inovatif untuk Anda.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pt-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
             <Card key={index} className="text-center">
                <CardHeader>
                    <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardContent>
            </Card>
          ))
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                    <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="team member portrait" />
                        <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-primary font-medium">{member.title}</p>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
