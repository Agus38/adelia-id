
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Mail, Users } from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
  {
    name: 'Adelia',
    title: 'Project Manager',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'AD',
    socialLinks: [
      { name: 'GitHub', url: '#', icon: Github },
      { name: 'LinkedIn', url: '#', icon: Linkedin },
      { name: 'Email', url: '#', icon: Mail },
    ],
  },
  {
    name: 'Budi',
    title: 'Lead Developer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'BU',
    socialLinks: [
      { name: 'GitHub', url: '#', icon: Github },
      { name: 'LinkedIn', url: '#', icon: Linkedin },
      { name: 'Email', url: '#', icon: Mail },
    ],
  },
  {
    name: 'Citra',
    title: 'UI/UX Designer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'CI',
    socialLinks: [
      { name: 'GitHub', url: '#', icon: Github },
      { name: 'LinkedIn', url: '#', icon: Linkedin },
      { name: 'Email', url: '#', icon: Mail },
    ],
  },
  {
    name: 'Dewi',
    title: 'QA Engineer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'DE',
    socialLinks: [
      { name: 'GitHub', url: '#', icon: Github },
      { name: 'LinkedIn', url: '#', icon: Linkedin },
      { name: 'Email', url: '#', icon: Mail },
    ],
  },
];


export default function TimPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <Users className="h-10 w-10" />
        <h2 className="text-3xl font-bold tracking-tight">Tim Kami</h2>
        <p className="text-muted-foreground max-w-xl">
            Kenali orang-orang hebat di balik Adelia-ID. Kami adalah tim yang bersemangat dalam menciptakan solusi inovatif untuk Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        {teamMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                    <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
                        <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="team member portrait" />
                        <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-xl">{member.title}</CardTitle>
                    <p className="text-primary font-medium">{member.name}</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <div className="flex gap-2">
                        {member.socialLinks.map((link) => (
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
        ))}
      </div>
    </div>
  );
}
