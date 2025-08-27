
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
import { Trash2, Loader2, PlusCircle } from 'lucide-react';
import { useAboutInfoConfig, saveAboutInfoConfig, type AboutInfo } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';

export function AboutSettings() {
  const { aboutInfo, isLoading } = useAboutInfoConfig();
  const [localInfo, setLocalInfo] = useState<AboutInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (aboutInfo) {
      setLocalInfo(JSON.parse(JSON.stringify(aboutInfo)));
    }
  }, [aboutInfo]);

  if (isLoading || !localInfo) {
    return (
      <Card>
          <CardHeader>
              <CardTitle>Formulir Informasi Aplikasi</CardTitle>
              <CardDescription>
                Perbarui detail yang ditampilkan di halaman 'Tentang'.
              </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
      </Card>
    )
  }

  const handleInfoChange = (field: keyof Omit<AboutInfo, 'features'>, value: string) => {
    if (!localInfo) return;
    setLocalInfo({ ...localInfo, [field]: value });
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    if (!localInfo) return;
    const newFeatures = [...localInfo.features];
    newFeatures[index] = value;
    setLocalInfo({ ...localInfo, features: newFeatures });
  };
  
  const handleAddFeature = () => {
    if (!localInfo) return;
    setLocalInfo({ ...localInfo, features: [...localInfo.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    if (!localInfo) return;
    const newFeatures = [...localInfo.features];
    newFeatures.splice(index, 1);
    setLocalInfo({ ...localInfo, features: newFeatures });
  };

  const handleSaveChanges = async () => {
    if (!localInfo) return;
    setIsSaving(true);
    try {
        await saveAboutInfoConfig(localInfo);
        toast({
            title: 'Perubahan Disimpan!',
            description: "Informasi halaman 'Tentang' telah berhasil diperbarui.",
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
        <CardTitle>Formulir Informasi Aplikasi</CardTitle>
        <CardDescription>
          Perbarui detail yang ditampilkan di halaman 'Tentang'. Perubahan akan
          terlihat setelah disimpan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="appName">Nama Aplikasi</Label>
          <Input
            id="appName"
            value={localInfo.appName}
            onChange={(e) => handleInfoChange('appName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Versi Aplikasi</Label>
          <Input
            id="version"
            value={localInfo.version}
            onChange={(e) => handleInfoChange('version', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Singkat</Label>
          <Textarea
            id="description"
            value={localInfo.description}
            onChange={(e) => handleInfoChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div>
            <Label>Daftar Fitur</Label>
            <div className="space-y-2 pt-2">
                {localInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            placeholder="Deskripsi fitur"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFeature(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={handleAddFeature}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Fitur
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
