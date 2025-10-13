
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDeveloperInfoConfig } from '@/lib/menu-store';
import { allIcons } from '@/lib/menu-items-v2';

export default function DeveloperPage() {
  const { developerInfo, isLoading } = useDeveloperInfoConfig();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
       <Card className="w-full max-w-2xl">
         <CardHeader className="text-center">
           <CardTitle className="text-2xl md:text-3xl">Informasi Developer</CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Mengenal lebih dekat sosok di balik pengembangan aplikasi ini.
           </CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col md:flex-row items-center gap-8 pt-4">
            <div className="flex-shrink-0 relative group">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={developerInfo.avatarUrl} alt={developerInfo.name} data-ai-hint="developer portrait" />
                <AvatarFallback>{getAvatarFallback(developerInfo.name)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-background p-1.5 rounded-full shadow-md">
                <Code className="h-4 w-4 text-primary" />
              </div>
            </div>
           <div className="text-center md:text-left">
             <h2 className="text-2xl font-bold">{developerInfo.name}</h2>
             <p className="text-primary font-medium">{developerInfo.title}</p>
             <p className="text-muted-foreground mt-2">
               {developerInfo.bio}
             </p>
           </div>
         </CardContent>
         <CardFooter className="flex flex-col items-center gap-4 pt-6">
           <p className="text-sm text-muted-foreground">Terhubung dengan saya:</p>
           <div className="flex gap-4">
             {developerInfo.socialLinks.map((link) => {
                const IconComponent = allIcons[link.iconName as keyof typeof allIcons];
                if (!IconComponent) return null;
                return (
                    <Link href={link.url} key={link.name} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon">
                        <IconComponent className="h-5 w-5" />
                        <span className="sr-only">{link.name}</span>
                    </Button>
                    </Link>
                );
            })}
           </div>
         </CardFooter>
       </Card>
    </div>
  );
}
