
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Send, Save, Loader2, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { getSmwReport, addOrUpdateSmwReport } from '@/lib/smw-manyar-store';

const sisaIkanItems = [
  { id: 'daging', label: 'DAGING' },
  { id: 'babat', label: 'BABAT' },
  { id: 'paru', label: 'PARU' },
  { id: 'usus', label: 'USUS' },
  { id: 'ati', label: 'ATI' },
  { id: 'otak', label: 'OTAK' },
  { id: 'telur', label: 'TELUR' },
  { id: 'kuah', label: 'KUAH' },
  { id: 'bgoreng', label: 'B•GORENG' },
  { id: 'seledri', label: 'SELEDRI' },
  { id: 'garam', label: 'GARAM' },
];

const terjualItems = [
  { id: 'babat', label: 'Babat' },
  { id: 'babatTelur', label: 'Babat Telur' },
  { id: 'biasa', label: 'Biasa' },
  { id: 'biasaTelur', label: 'Biasa Telur' },
  { id: 'daging', label: 'Daging' },
  { id: 'dagingTelur', label: 'Daging Telur' },
  { id: 'dagingDoubleT', label: 'Daging Double T' },
  { id: 'istimewa', label: 'Istimewa' },
  { id: 'atiOtak', label: 'Ati Otak' },
  { id: 'atiOtakTelur', label: 'Ati Otak Telur' },
  { id: 'telurKuah', label: 'Telur Kuah' },
  { id: 'telur', label: 'Telur' },
  { id: 'nasi', label: 'Nasi' },
];

const onlineSalesItems = [
  { id: 'goFood', label: 'GoFood' },
  { id: 'grabFood', label: 'GrabFood' },
  { id: 'cash', label: 'Cash/Dll' },
];

type FormData = {
  [key: string]: string;
};

interface SmwManyarReportFormProps {
    setIsDirty: (isDirty: boolean) => void;
}

export function SmwManyarReportForm({ setIsDirty }: SmwManyarReportFormProps) {
  const [formData, setFormData] = React.useState<FormData>({});
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isFetchingReport, setIsFetchingReport] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = React.useCallback(() => {
    setFormData({});
    setIsDirty(false);
  }, [setIsDirty]);

  const populateForm = React.useCallback((report: { formData: FormData }) => {
     setFormData(report.formData);
     setIsDirty(false);
  }, [setIsDirty]);
  
  React.useEffect(() => {
    if (!date || !currentUser) return;

    const fetchReport = async () => {
      setIsFetchingReport(true);
      try {
        const report = await getSmwReport(date, currentUser.uid);
        if (report) {
          populateForm(report);
        } else {
          resetForm();
        }
      } catch (error) {
         toast({
          title: 'Gagal Memuat Laporan',
          description: 'Terjadi kesalahan saat mengambil data dari database.',
          variant: 'destructive',
        });
        resetForm();
      } finally {
        setIsFetchingReport(false);
      }
    };

    fetchReport();
  }, [date, currentUser, resetForm, populateForm, toast]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    const { id, value } = e.target;
    const rawValue = value.replace(/\./g, '');
      if (/^\d*$/.test(rawValue) && rawValue.length <= 9) {
          const numValue = Number(rawValue);
          setFormData(prev => ({ ...prev, [id]: numValue === 0 ? '' : numValue.toString() }));
      }
  };

  const formatDisplayValue = (value: string | undefined) => {
    if (!value) return '';
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatCurrencyForDisplay = (value: string | undefined) => {
    if (!value) return '';
    return `Rp ${formatDisplayValue(value)}`;
  };
  
  const formatCurrencyForWA = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const totalPorsi = terjualItems
    .filter(item => item.id !== 'telur' && item.id !== 'nasi')
    .reduce((sum, item) => sum + (Number(formData[`terjual-${item.id}`]) || 0), 0);
  
  const grossTotal = onlineSalesItems.reduce((sum, item) => sum + (Number(formData[`online-${item.id}`]) || 0), 0);

  const handleSaveReport = async () => {
    if (!date || !currentUser) {
        toast({ title: 'Data Tidak Lengkap', description: 'Tanggal harus dipilih dan Anda harus login.', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
        const reportData = {
            date,
            formData,
            createdBy: currentUser.displayName || 'Pengguna',
            userId: currentUser.uid,
        };
        await addOrUpdateSmwReport(reportData);
        toast({ title: 'Laporan Disimpan', description: 'Data laporan SMW Manyar telah berhasil disimpan.' });
        setIsDirty(false);
    } catch (error) {
        toast({ title: 'Gagal Menyimpan', description: 'Terjadi kesalahan saat menyimpan laporan.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSendWhatsApp = () => {
    const reportDate = date ? format(date, 'eeee, dd-MM-yyyy', { locale: id }) : 'Belum diisi';
    
    const sisaIkanText = sisaIkanItems
      .map(item => `${item.label.padEnd(14, ' ')}: ${formData[`sisa-${item.id}`] || ' '}`)
      .join('\n');
      
    const terjualText = terjualItems
      .filter(item => formData[`terjual-${item.id}`] && Number(formData[`terjual-${item.id}`]) > 0)
      .map(item => `${item.label.padEnd(14, ' ')}: ${formData[`terjual-${item.id}`]}`)
      .join('\n');

    const onlineSalesText = onlineSalesItems
      .map(item => `${item.label.padEnd(14, ' ')}: Rp ${formatCurrencyForWA(Number(formData[`online-${item.id}`]) || 0)}`)
      .join('\n');

    const message = `
*Laporan: Smw Manyar*
*Tanggal: ${reportDate}*
\n\n
*SISA IKAN* \`\`\`
-------------------------------
${sisaIkanText}\`\`\`
\n\n
*TERJUAL* \`\`\`
-------------------------------
${terjualText.length > 0 ? terjualText : 'Tidak ada'}\`\`\`
\`\`\`-------------------------------\`\`\`
*Porsi                        : ${totalPorsi}*
\n\n
*TOTAL ONLINE SALES* \`\`\`
-------------------------------
${onlineSalesText}\`\`\`
\`\`\`-------------------------------\`\`\`
*Gross Total             : Rp ${formatCurrencyForWA(grossTotal)}*
    `.trim().replace(/^\s+/gm, '');

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoadingUser) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
      <Card className="relative">
           {isFetchingReport && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Memuat data laporan...</span>
              </div>
          )}
        <CardHeader>
          <CardTitle>Formulir Laporan</CardTitle>
           <div className="space-y-2 pt-2">
              <Label>Pilih Tanggal Laporan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full max-w-sm justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'eeee, dd MMMM yyyy', { locale: id }) : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <Tabs defaultValue="sisa-ikan">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sisa-ikan">Sisa Ikan</TabsTrigger>
              <TabsTrigger value="terjual">Terjual</TabsTrigger>
            </TabsList>
            <TabsContent value="sisa-ikan" className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sisaIkanItems.map(item => (
                  <div key={`sisa-${item.id}`} className="space-y-1.5">
                    <Label htmlFor={`sisa-${item.id}`}>{item.label}</Label>
                    <Input id={`sisa-${item.id}`} type="text" value={formData[`sisa-${item.id}`] || ''} onChange={handleInputChange} maxLength={7} />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="terjual" className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {terjualItems.map(item => (
                  <div key={`terjual-${item.id}`} className="space-y-1.5">
                    <Label htmlFor={`terjual-${item.id}`}>{item.label}</Label>
                    <Input id={`terjual-${item.id}`} type="number" value={formData[`terjual-${item.id}`] || ''} onChange={handleInputChange} maxLength={7} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          {/* Total Online Sales */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Total Online Sales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {onlineSalesItems.map(item => (
                <div key={`online-${item.id}`} className="space-y-1.5">
                  <Label htmlFor={`online-${item.id}`}>{item.label}</Label>
                  <Input 
                    id={`online-${item.id}`}
                    type="text" 
                    inputMode="numeric"
                    placeholder="Rp 0" 
                    value={formatDisplayValue(formData[`online-${item.id}`])} 
                    onChange={handleNumericInputChange} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-4">
              <h3 className="font-semibold text-lg">Ringkasan</h3>
              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                   <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Total Porsi</Label>
                      <div className="text-base font-bold text-right">{totalPorsi}</div>
                  </div>
                   <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold">Gross Total</Label>
                      <div className="text-base font-bold text-right">{formatCurrencyForDisplay(String(grossTotal)) || 'Rp 0'}</div>
                  </div>
              </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-4 border-t pt-6">
          <Button onClick={handleSaveReport} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan Laporan
          </Button>
          <Button onClick={handleSendWhatsApp} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            <Send className="mr-2 h-4 w-4" />
            Kirim Laporan
          </Button>
        </CardFooter>
      </Card>
  );
}
