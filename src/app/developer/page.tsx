
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Globe, Code } from 'lucide-react';
import Link from 'next/link';

const developerInfo = {
  name: 'Agus Eka',
  title: 'Full-Stack Developer & UI/UX Enthusiast',
  avatarUrl: 'https://placehold.co/150x150.png',
  avatarFallback: 'AE',
  bio: 'Saya adalah seorang pengembang perangkat lunak dengan hasrat untuk menciptakan solusi teknologi yang inovatif dan aplikasi yang ramah pengguna. Berkomitmen pada pembelajaran berkelanjutan dan keunggulan dalam pengembangan.',
  socialLinks: [
    {
      name: 'GitHub',
      url: 'https://github.com/aguseka',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/aguseka',
      icon: Linkedin,
    },
    {
      name: 'Website',
      url: 'https://aguseka.dev',
      icon: Globe,
    },
    {
      name: 'Email',
      url: 'mailto:contact@aguseka.dev',
      icon: Mail,
    },
  ]
};

export default function DeveloperPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
       <Card className="w-full max-w-2xl">
         <CardHeader className="text-center">
           <CardTitle className="text-3xl">Informasi Developer</CardTitle>
           <CardDescription>
             Mengenal lebih dekat sosok di balik pengembangan aplikasi ini.
           </CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col md:flex-row items-center gap-8 pt-4">
           <div className="flex-shrink-0 relative">
             <Avatar className="h-32 w-32 border-4 border-primary/20">
               <AvatarImage src={developerInfo.avatarUrl} alt={developerInfo.name} data-ai-hint="developer portrait" />
               <AvatarFallback>{developerInfo.avatarFallback}</AvatarFallback>
             </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full shadow-md">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Code className="h-6 w-6 text-primary" />
                </div>
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
             {developerInfo.socialLinks.map((link) => (
                <Link href={link.url} key={link.name} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.name}</span>
                  </Button>
                </Link>
             ))}
           </div>
         </CardFooter>
       </Card>
    </div>
  );
}
