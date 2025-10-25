
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
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
import { Trash2, Loader2, PlusCircle, Globe, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useDeveloperInfoConfig, saveDeveloperInfoConfig, type DeveloperInfo, type SocialLink } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';
import { allIcons } from '@/lib/menu-items-v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const iconMap: { [key: string]: React.ElementType } = allIcons;

export function DeveloperSettings() {
  const { developerInfo, isLoading } = useDeveloperInfoConfig();
  const [localInfo, setLocalInfo] = useState<DeveloperInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingLinkIndex, setUploadingLinkIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (developerInfo) {
      // Ensure all links have a unique ID for stable keys
      const infoWithIds = {
        ...developerInfo,
        socialLinks: developerInfo.socialLinks.map(link => ({
          ...link,
          id: link.id || `link-${Math.random()}`
        }))
      };
      setLocalInfo(JSON.parse(JSON.stringify(infoWithIds)));
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
      } else if (field === 'iconType') {
          linkToUpdate[field] = value as 'icon' | 'image';
      } else {
          (linkToUpdate as any)[field] = value;
      }
      
      newLinks[index] = linkToUpdate;
      setLocalInfo(prev => prev ? ({...prev, socialLinks: newLinks}) : null);
  }

  const handleAddLink = () => {
    if (!localInfo) return;
    const newLink: SocialLink = {
        id: `link-${Date.now()}`, // Add a unique ID
        name: 'New Link',
        url: '',
        iconType: 'icon',
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

  const handleLinkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file || !localInfo) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file avatar tidak boleh melebihi 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLinkIndex(index);
    try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

        handleLinkChange(index, 'iconImageUrl', dataUrl);
        
        toast({
          title: "Gambar Diproses",
          description: "Gambar ikon berhasil diproses. Jangan lupa simpan perubahan.",
        });

    } catch (error) {
      toast({
        title: "Gagal Memproses Gambar",
        description: "Terjadi kesalahan saat memproses gambar.",
        variant: "destructive",
      });
    } finally {
        setUploadingLinkIndex(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file avatar tidak boleh melebihi 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

        setLocalInfo(prev => prev ? { ...prev, avatarUrl: dataUrl } : null);
        
        toast({
          title: "Gambar Diproses",
          description: "Avatar berhasil diproses. Jangan lupa simpan perubahan.",
        });

    } catch (error) {
      console.error("Avatar processing error:", error);
      toast({
        title: "Gagal Memproses Gambar",
        description: "Terjadi kesalahan saat memproses gambar.",
        variant: "destructive",
      });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

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
  
  const isSaveDisabled = isSaving || isUploading || uploadingLinkIndex !== null;

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
                <Label htmlFor="avatarUrl">URL atau Unggah Avatar</Label>
                 <div className="flex gap-2">
                    <Input
                        id="avatarUrl"
                        value={localInfo.avatarUrl}
                        onChange={(e) => handleInfoChange('avatarUrl', e.target.value)}
                    />
                    <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        <span className="sr-only">Unggah Avatar</span>
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isUploading}
                    />
                </div>
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
                         <div key={link.id} className="space-y-4 p-4 border rounded-md relative">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveLink(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Hapus Tautan</span>
                            </Button>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Label Tautan</Label>
                                  <Input placeholder="Contoh: GitHub" value={link.name} onChange={(e) => handleLinkChange(index, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>URL Lengkap</Label>
                                  <Input placeholder="https://..." value={link.url} onChange={(e) => handleLinkChange(index, 'url', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Jenis Ikon</Label>
                                <RadioGroup 
                                    value={link.iconType || 'icon'} 
                                    onValueChange={(value) => handleLinkChange(index, 'iconType', value)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="icon" id={`r-icon-${index}`} />
                                        <Label htmlFor={`r-icon-${index}`} className="font-normal">Ikon Bawaan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="image" id={`r-image-${index}`} />
                                        <Label htmlFor={`r-image-${index}`} className="font-normal">Gambar URL/Unggah</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            
                            {(link.iconType === 'icon' || !link.iconType) ? (
                                <div className="space-y-2">
                                  <Label>Ikon</Label>
                                  <Select value={link.iconName} onValueChange={(value) => handleLinkChange(index, 'iconName', value)}>
                                      <SelectTrigger>
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
                                </div>
                            ) : (
                               <div className="space-y-2">
                                  <Label>URL Ikon atau Unggah</Label>
                                  <div className="flex gap-2">
                                      <Input
                                          placeholder="https://.../icon.png"
                                          value={link.iconImageUrl || ''}
                                          onChange={(e) => handleLinkChange(index, 'iconImageUrl', e.target.value)}
                                      />
                                      <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploadingLinkIndex !== null}>
                                        {(uploadingLinkIndex === index) ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                                         <span className="sr-only">Unggah Ikon</span>
                                      </Button>
                                      <input
                                          type="file"
                                          ref={fileInputRef}
                                          onChange={(e) => handleLinkImageUpload(e, index)}
                                          className="hidden"
                                          accept="image/png, image/jpeg, image/svg+xml, image/webp"
                                          disabled={uploadingLinkIndex !== null}
                                      />
                                  </div>
                               </div>
                            )}
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
        <Button onClick={handleSaveChanges} disabled={isSaveDisabled}>
            {(isSaving || isUploading || uploadingLinkIndex !== null) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
        </Button>
      </CardFooter>
    </Card>
  );
}

    