
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

const teamMembers = [
  {
    name: 'Adelia',
    title: 'Project Manager',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'AD',
  },
  {
    name: 'Budi',
    title: 'Lead Developer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'BU',
  },
  {
    name: 'Citra',
    title: 'UI/UX Designer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'CI',
  },
  {
    name: 'Dewi',
    title: 'QA Engineer',
    avatarUrl: 'https://placehold.co/150x150.png',
    avatarFallback: 'DE',
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pt-8">
        {teamMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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
        ))}
      </div>
    </div>
  );
}
