
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Save, Trash2, type LucideIcon } from 'lucide-react';
import { useSupportPageConfig, saveSupportPageConfig, type FaqItem, type ContactMethod } from '@/lib/menu-store';
import { toast } from '@/hooks/use-toast';
import { allIcons } from '@/lib/menu-items-v2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const iconMap: { [key: string]: React.ElementType } = allIcons;

export function SupportSettings() {
  const { supportConfig, isLoading } = useSupportPageConfig();
  const [localConfig, setLocalConfig] = useState<{ faqItems: FaqItem[], contactMethods: ContactMethod[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (supportConfig) {
      setLocalConfig(JSON.parse(JSON.stringify(supportConfig)));
    }
  }, [supportConfig]);

  if (isLoading || !localConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Konten Halaman Bantuan</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // Handlers for FAQ
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...localConfig.faqItems];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setLocalConfig({ ...localConfig, faqItems: newFaqs });
  };
  
  const handleAddFaq = () => {
    const newFaq: FaqItem = { id: `faq-${Date.now()}`, question: 'Pertanyaan Baru', answer: 'Jawaban baru.' };
    setLocalConfig({ ...localConfig, faqItems: [...localConfig.faqItems, newFaq] });
  };
  
  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...localConfig.faqItems];
    newFaqs.splice(index, 1);
    setLocalConfig({ ...localConfig, faqItems: newFaqs });
  };
  
  // Handlers for Contact Methods
  const handleContactChange = (index: number, field: keyof Omit<ContactMethod, 'id' | 'icon'>, value: string) => {
    const newContacts = [...localConfig.contactMethods];
    const contactToUpdate = { ...newContacts[index] };
    
    if (field === 'iconName') {
        (contactToUpdate as any)[field] = value;
    } else {
        (contactToUpdate as any)[field] = value;
    }
    newContacts[index] = contactToUpdate;
    setLocalConfig({ ...localConfig, contactMethods: newContacts });
  };
  
  const handleAddContact = () => {
    const newContact: any = {
      id: `contact-${Date.now()}`,
      iconName: 'Mail',
      title: 'Metode Baru',
      value: '',
      action: '',
      actionLabel: 'Hubungi'
    };
    setLocalConfig({ ...localConfig, contactMethods: [...localConfig.contactMethods, newContact] });
  };
  
  const handleRemoveContact = (index: number) => {
    const newContacts = [...localConfig.contactMethods];
    newContacts.splice(index, 1);
    setLocalConfig({ ...localConfig, contactMethods: newContacts });
  };

  const handleSaveChanges = async () => {
    if (!localConfig) return;
    setIsSaving(true);
    try {
      await saveSupportPageConfig(localConfig);
      toast({
        title: 'Perubahan Disimpan!',
        description: 'Konten halaman bantuan telah berhasil diperbarui.',
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan yang Sering Diajukan (FAQ)</CardTitle>
          <CardDescription>Kelola daftar pertanyaan dan jawaban yang ditampilkan di halaman bantuan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {localConfig.faqItems.map((faq, index) => (
              <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger>
                  <span className="truncate pr-4">{faq.question || 'Pertanyaan baru'}</span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                   <div className="space-y-2">
                        <Label htmlFor={`faq-q-${index}`}>Pertanyaan</Label>
                        <Input id={`faq-q-${index}`} value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`faq-a-${index}`}>Jawaban</Label>
                        <Textarea id={`faq-a-${index}`} value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} rows={4} />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveFaq(index)}>
                        <Trash2 className="mr-2 h-4 w-4"/> Hapus FAQ
                    </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
           <Button variant="outline" onClick={handleAddFaq} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4"/> Tambah FAQ
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Metode Kontak</CardTitle>
            <CardDescription>Kelola opsi kontak yang tersedia untuk pengguna.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {localConfig.contactMethods.map((contact, index) => (
                <div key={contact.id} className="p-4 border rounded-lg space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ikon</Label>
                             <Select value={contact.iconName} onValueChange={(value) => handleContactChange(index, 'iconName', value)}>
                                <SelectTrigger>
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            {React.createElement(iconMap[contact.iconName] || iconMap['Mail'], { className: "h-4 w-4" })}
                                            <span>{contact.iconName}</span>
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
                         <div className="space-y-2">
                            <Label>Judul</Label>
                            <Input value={contact.title} onChange={(e) => handleContactChange(index, 'title', e.target.value)} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label>Nilai/Konten (cth: email@domain.com)</Label>
                        <Input value={contact.value} onChange={(e) => handleContactChange(index, 'value', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Aksi (cth: mailto:email@domain.com)</Label>
                            <Input value={contact.action} onChange={(e) => handleContactChange(index, 'action', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Label Tombol Aksi</Label>
                            <Input value={contact.actionLabel} onChange={(e) => handleContactChange(index, 'actionLabel', e.target.value)} />
                        </div>
                    </div>
                     <Button variant="destructive" size="sm" onClick={() => handleRemoveContact(index)}>
                        <Trash2 className="mr-2 h-4 w-4"/> Hapus Metode Kontak
                    </Button>
                </div>
             ))}
             <Button variant="outline" onClick={handleAddContact} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4"/> Tambah Metode Kontak
            </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end sticky bottom-6 right-6">
        <Button onClick={handleSaveChanges} disabled={isSaving} size="lg" className="shadow-lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4"/>
            Simpan Semua Perubahan
        </Button>
      </div>
    </div>
  );
}
