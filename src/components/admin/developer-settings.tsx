
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Github, Linkedin, Mail, Globe, Trash2 } from 'lucide-react';
import Image from 'next/image';

const initialDeveloperInfo = {
  name: 'Agus Eka',
  title: 'Full-Stack Developer & UI/UX Enthusiast',
  avatarUrl: 'https://placehold.co/150x150.png',
  bio: 'Saya adalah seorang pengembang perangkat lunak dengan hasrat untuk menciptakan solusi teknologi yang inovatif dan aplikasi yang ramah pengguna. Berkomitmen pada pembelajaran berkelanjutan dan keunggulan dalam pengembangan.',
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com/aguseka', icon: 'Github' },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/aguseka', icon: 'Linkedin' },
    { name: 'Website', url: 'https://aguseka.dev', icon: 'Globe' },
    { name: 'Email', url: 'mailto:contact@aguseka.dev', icon: 'Mail' },
  ],
};

const iconMap: { [key: string]: React.ElementType } = {
  Github,
  Linkedin,
  Mail,
  Globe,
};


export function DeveloperSettings() {
  const [developerInfo, setDeveloperInfo] = useState(initialDeveloperInfo);

  const handleInfoChange = (field: keyof typeof developerInfo, value: string) => {
    setDeveloperInfo((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleLinkChange = (index: number, field: 'name' | 'url', value: string) => {
      const newLinks = [...developerInfo.socialLinks];
      newLinks[index] = {...newLinks[index], [field]: value};
      setDeveloperInfo(prev => ({...prev, socialLinks: newLinks}));
  }

  const handleSaveChanges = () => {
    // NOTE: Mock implementation. In a real app, you would save this to a database.
    console.log('Saving changes:', developerInfo);
    alert('Perubahan disimpan! (Simulasi)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Informasi Developer</CardTitle>
        <CardDescription>
          Perbarui detail yang ditampilkan di halaman developer. Perubahan akan
          terlihat setelah disimpan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
             <Image
                src={developerInfo.avatarUrl}
                alt={developerInfo.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            <div className="w-full space-y-2">
                <Label htmlFor="avatarUrl">URL Avatar</Label>
                <Input
                    id="avatarUrl"
                    value={developerInfo.avatarUrl}
                    onChange={(e) => handleInfoChange('avatarUrl', e.target.value)}
                />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            value={developerInfo.name}
            onChange={(e) => handleInfoChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Jabatan</Label>
          <Input
            id="title"
            value={developerInfo.title}
            onChange={(e) => handleInfoChange('title', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={developerInfo.bio}
            onChange={(e) => handleInfoChange('bio', e.target.value)}
            rows={4}
          />
        </div>

        <div>
            <Label>Tautan Sosial Media</Label>
            <div className="space-y-4 pt-2">
                {developerInfo.socialLinks.map((link, index) => {
                    const Icon = iconMap[link.icon];
                    return (
                         <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                             <Input
                                placeholder="Nama Link (cth: GitHub)"
                                value={link.name}
                                onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="URL Lengkap"
                                value={link.url}
                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                className="flex-1"
                            />
                             <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
      </CardFooter>
    </Card>
  );
}
