
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { Trash2, Loader2, PlusCircle, Globe } from 'lucide-react';
import Image from 'next/image';
import { useDeveloperInfoConfig, saveDeveloperInfoConfig, type DeveloperInfo, type SocialLink } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';
import { allIcons } from '@/lib/menu-items-v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const iconMap: { [key: string]: React.ElementType } = allIcons;

export function DeveloperSettings() {
  const { developerInfo, isLoading } = useDeveloperInfoConfig();
  const [localInfo, setLocalInfo] = useState<DeveloperInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (developerInfo) {
      setLocalInfo(JSON.parse(JSON.stringify(developerInfo)));
    }
  }, [developerInfo]);

  if (isLoading || !localInfo) {
    return (
      <Card>
          <CardHeader>
              <CardTitle>Formulir Informasi Developer</CardTitle>
              <CardDescription>
              Perbarui detail yang ditampilkan di halaman developer. Perubahan akan
              terlihat setelah disimpan.
              </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
      </Card>
    )
  }

  const handleInfoChange = (field: keyof Omit<DeveloperInfo, 'socialLinks'>, value: string) => {
    if (!localInfo) return;
    setLocalInfo({ ...localInfo, [field]: value });
  };
  
  const handleLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    if (!localInfo) return;
    const newLinks = [...localInfo.socialLinks];
    const linkToUpdate = { ...newLinks[index] };
    
    if (field === 'iconName') {
        linkToUpdate.iconName = value;
        linkToUpdate.icon = iconMap[value];
    } else if (field === 'name' || field === 'url') {
        linkToUpdate[field] = value;
    }
    
    newLinks[index] = linkToUpdate;
    setLocalInfo(prev => prev ? ({...prev, socialLinks: newLinks}) : null);
  }

  const handleAddLink = () => {
    if (!localInfo) return;
    const newLink: SocialLink = {
        name: '',
        url: '',
        iconName: 'Globe',
        icon: Globe
    };
    setLocalInfo({
        ...localInfo,
        socialLinks: [...localInfo.socialLinks, newLink]
    });
  }
  
  const handleRemoveLink = (index: number) => {
    if (!localInfo) return;
    const newLinks = [...localInfo.socialLinks];
    newLinks.splice(index, 1);
    setLocalInfo({ ...localInfo, socialLinks: newLinks });
  }

  const handleSaveChanges = async () => {
    if (!localInfo) return;
    setIsSaving(true);
    try {
        await saveDeveloperInfoConfig(localInfo);
        toast({
            title: 'Perubahan Disimpan!',
            description: 'Informasi developer telah berhasil diperbarui.',
        });
    } catch (error) {
        toast({
            title: 'Gagal Menyimpan',
            description: 'Terjadi kesalahan saat menyimpan data.',
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
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
                src={localInfo.avatarUrl}
                alt={localInfo.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            <div className="w-full space-y-2">
                <Label htmlFor="avatarUrl">URL Avatar</Label>
                <Input
                    id="avatarUrl"
                    value={localInfo.avatarUrl}
                    onChange={(e) => handleInfoChange('avatarUrl', e.target.value)}
                />
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            value={localInfo.name}
            onChange={(e) => handleInfoChange('name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Jabatan</Label>
          <Input
            id="title"
            value={localInfo.title}
            onChange={(e) => handleInfoChange('title', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={localInfo.bio}
            onChange={(e) => handleInfoChange('bio', e.target.value)}
            rows={4}
          />
        </div>

        <div>
            <Label>Tautan Sosial Media</Label>
            <div className="space-y-4 pt-2">
                {localInfo.socialLinks.map((link, index) => {
                    const Icon = iconMap[link.iconName] || Globe;
                    return (
                         <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            <Select value={link.iconName} onValueChange={(value) => handleLinkChange(index, 'iconName', value)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue>
                                        <div className='flex items-center gap-2'>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span className='truncate'>{link.iconName}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(iconMap).sort().map(iconName => (
                                        <SelectItem key={iconName} value={iconName}>
                                            <div className="flex items-center gap-2">
                                                {React.createElement(iconMap[iconName], { className: "h-4 w-4" })}
                                                <span>{iconName}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Input
                                placeholder="URL Lengkap"
                                value={link.url}
                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                className="flex-1"
                            />
                             <Button variant="ghost" size="icon" onClick={() => handleRemoveLink(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    )
                })}
                 <Button variant="outline" size="sm" onClick={handleAddLink}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tautan
                </Button>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
        </Button>
      </CardFooter>
    </Card>
  );
}
