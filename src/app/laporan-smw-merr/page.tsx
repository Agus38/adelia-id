
'use client';

import * as React from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar as CalendarIcon, PlusCircle, Save, Send, Trash2, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { addOrUpdateReport, getReport } from '@/lib/report-store';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { usePageAccess } from '@/hooks/use-page-access';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';


type ExtraField = {
  id: number;
  name: string;
  value: number;
};

type DeletionInfo = {
  type: 'pemasukan' | 'pengeluaran';
  id: number;
} | null;

export default function DailyReportPage() {
  const { hasAccess, isLoading: isLoadingAccess } = usePageAccess('laporan-smw-merr');
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [shift, setShift] = React.useState<'pagi' | 'sore'>('pagi');
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetchingReport, setIsFetchingReport] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [isExistingReport, setIsExistingReport] = React.useState(false);


  const { toast } = useToast();
  const { UnsavedChangesDialog } = useUnsavedChangesWarning(isDirty);

  // Financial State
  const [modalAwal, setModalAwal] = React.useState(0);
  const [omsetBersih, setOmsetBersih] = React.useState(0);
  const [pajak, setPajak] = React.useState(0);

  // Online Income
  const [goFood, setGoFood] = React.useState(0);
  const [grabFood, setGrabFood] = React.useState(0);
  const [shopeeFood, setShopeeFood] = React.useState(0);
  const [qrisMandiri, setQrisMandiri] = React.useState(0);
  const [qrisBri, setQrisBri] = React.useState(0);
  const [debitMandiri, setDebitMandiri] = React.useState(0);
  const [debitBri, setDebitBri] = React.useState(0);
  const [extraPemasukan, setExtraPemasukan] = React.useState<ExtraField[]>([]);

  // Offline Expenses
  const [transport, setTransport] = React.useState(0);
  const [goSend, setGoSend] = React.useState(0);
  const [iuranBulanan, setIuranBulanan] = React.useState(0);
  const [bonus, setBonus] = React.useState(0);
  const [lembur, setLembur] = React.useState(0);
  const [extraPengeluaran, setExtraPengeluaran] = React.useState<ExtraField[]>([]);

  // Deletion state
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<DeletionInfo>(null);

  React.useEffect(() => {
    // To avoid hydration mismatch, set the initial date on the client side.
    setDate(new Date());

    const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = React.useCallback(() => {
    setModalAwal(0);
    setOmsetBersih(0);
    setPajak(0);
    setGoFood(0);
    setGrabFood(0);
    setShopeeFood(0);
    setQrisMandiri(0);
    setQrisBri(0);
    setDebitMandiri(0);
    setDebitBri(0);
    setTransport(0);
    setGoSend(0);
    setIuranBulanan(0);
    setBonus(0);
    setLembur(0);
    setExtraPemasukan([]);
    setExtraPengeluaran([]);
    setIsDirty(false);
  }, []);

  const populateForm = React.useCallback((report: any) => {
    setModalAwal(report.details.modalAwal || 0);
    setOmsetBersih(report.omsetBersih || 0);
    setPajak(report.details.pajak || 0);
    
    const pemasukanMap = new Map(report.details.pemasukan.map((p: any) => [p.name, p.value]));
    setGoFood(pemasukanMap.get('GoFood') || 0);
    setGrabFood(pemasukanMap.get('GrabFood') || 0);
    setShopeeFood(pemasukanMap.get('ShopeeFood') || 0);
    setQrisMandiri(pemasukanMap.get('Qris Mandiri') || 0);
    setQrisBri(pemasukanMap.get('Qris Bri') || 0);
    setDebitMandiri(pemasukanMap.get('Debit Mandiri') || 0);
    setDebitBri(pemasukanMap.get('Debit Bri') || 0);

    const pengeluaranMap = new Map(report.details.pengeluaran.map((p: any) => [p.name, p.value]));
    setTransport(pengeluaranMap.get('Transport') || 0);
    setGoSend(pengeluaranMap.get('GoSend') || 0);
    setIuranBulanan(pengeluaranMap.get('Iuran Bulanan') || 0);
    setBonus(pengeluaranMap.get('Bonus') || 0);
    setLembur(pengeluaranMap.get('Lembur') || 0);

    setExtraPemasukan(report.details.pemasukan.filter((p: any) => !['GoFood', 'GrabFood', 'ShopeeFood', 'Qris Mandiri', 'Qris Bri', 'Debit Mandiri', 'Debit Bri'].includes(p.name)).map((p: any) => ({...p, id: Math.random()})));
    setExtraPengeluaran(report.details.pengeluaran.filter((p: any) => !['Transport', 'GoSend', 'Iuran Bulanan', 'Bonus', 'Lembur'].includes(p.name)).map((p: any) => ({...p, id: Math.random()})));
    setIsDirty(false); // Reset dirty state after populating
  }, []);

  React.useEffect(() => {
    if (!date || !currentUser) return;
    setIsDirty(true); // Mark as dirty when date or shift changes, prompting a save
  }, [date, shift, currentUser]);
  
  React.useEffect(() => {
    if (!date || !currentUser) return;

    const fetchReport = async () => {
      setIsFetchingReport(true);
      try {
        const report = await getReport(date, shift, currentUser.uid);
        if (report) {
          populateForm(report);
          setIsExistingReport(true);
        } else {
          resetForm();
          setIsExistingReport(false);
        }
      } catch (error) {
         toast({
          title: 'Gagal Memuat Laporan',
          description: 'Terjadi kesalahan saat mengambil data dari database.',
          variant: 'destructive',
        });
        resetForm();
        setIsExistingReport(false);
      } finally {
        setIsFetchingReport(false);
      }
    };

    fetchReport();
  }, [date, shift, currentUser, resetForm, populateForm, toast]);


  // Calculations
  const omsetKotor = omsetBersih + pajak;

  const totalPemasukanOnline =
    goFood +
    grabFood +
    shopeeFood +
    qrisMandiri +
    qrisBri +
    debitMandiri +
    debitBri +
    extraPemasukan.reduce((sum, item) => sum + item.value, 0);

  const totalPengeluaranOffline =
    transport +
    goSend +
    iuranBulanan +
    bonus +
    lembur +
    extraPengeluaran.reduce((sum, item) => sum + item.value, 0);
  
  const totalPengeluaran = totalPemasukanOnline + totalPengeluaranOffline;

  const sisaOmset = omsetBersih - totalPengeluaran;
  const sisaOmsetPlusPajak = sisaOmset + pajak;
  const totalAkhir = sisaOmsetPlusPajak + modalAwal;

  const handleSaveReport = async () => {
    if (!date || !currentUser) {
       toast({
        title: 'Data Tidak Lengkap',
        description: 'Pastikan tanggal telah dipilih dan Anda sudah login.',
        variant: 'destructive',
      });
      return;
    }
     if (omsetBersih === 0) {
       toast({
        title: 'Omset Bersih Kosong',
        description: 'Harap isi omset bersih sebelum menyimpan laporan.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
        const pemasukanDetails = [
            { name: 'GoFood', value: goFood },
            { name: 'GrabFood', value: grabFood },
            { name: 'ShopeeFood', value: shopeeFood },
            { name: 'Qris Mandiri', value: qrisMandiri },
            { name: 'Qris Bri', value: qrisBri },
            { name: 'Debit Mandiri', value: debitMandiri },
            { name: 'Debit Bri', value: debitBri },
            ...extraPemasukan.map(({ id, ...rest }) => rest),
        ].filter(item => item.value > 0);

        const pengeluaranDetails = [
            { name: 'Transport', value: transport },
            { name: 'GoSend', value: goSend },
            { name: 'Iuran Bulanan', value: iuranBulanan },
            { name: 'Bonus', value: bonus },
            { name: 'Lembur', value: lembur },
            ...extraPengeluaran.map(({ id, ...rest }) => rest),
        ].filter(item => item.value > 0);
        
        const reportData = {
          date,
          shift,
          omsetBersih,
          totalSetor: totalAkhir,
          createdBy: currentUser.displayName || 'Pengguna',
          userId: currentUser.uid,
          details: {
              modalAwal,
              pajak,
              pemasukan: pemasukanDetails,
              pengeluaran: pengeluaranDetails,
          }
        };

        await addOrUpdateReport(reportData);
        
        toast({
          title: 'Laporan Disimpan!',
          description: 'Laporan keuangan harian telah berhasil disimpan.',
        });
        setIsDirty(false);
        setIsExistingReport(true); // After saving, it becomes an existing report
    } catch(error) {
        toast({
          title: 'Gagal Menyimpan',
          description: 'Terjadi kesalahan saat menyimpan laporan ke database.',
          variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleAddExtraField = (type: 'pemasukan' | 'pengeluaran') => {
    setIsDirty(true);
    const newField = { id: Date.now(), name: '', value: 0 };
    if (type === 'pemasukan') {
      setExtraPemasukan([...extraPemasukan, newField]);
    } else {
      setExtraPengeluaran([...extraPengeluaran, newField]);
    }
  };

  const confirmRemoveExtraField = (type: 'pemasukan' | 'pengeluaran', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };
  
  const handleRemoveExtraField = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setIsDirty(true);
    if (type === 'pemasukan') {
      setExtraPemasukan(extraPemasukan.filter(field => field.id !== id));
    } else {
      setExtraPengeluaran(extraPengeluaran.filter(field => field.id !== id));
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }
  
  const formatValue = (value: number) => {
    if (value === 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleNumericInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsDirty(true);
      const rawValue = e.target.value.replace(/\./g, '');
      if (/^\d*$/.test(rawValue) && rawValue.length <= 9) {
          const numValue = Number(rawValue);
          setter(numValue);
      }
  };
  
  const handleExtraFieldChange = (
    type: 'pemasukan' | 'pengeluaran',
    id: number,
    field: 'name' | 'value',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsDirty(true);
    const setter = type === 'pemasukan' ? setExtraPemasukan : setExtraPengeluaran;
    const list = type === 'pemasukan' ? extraPemasukan : extraPengeluaran;
    
    setter(
      list.map(item => {
        if (item.id === id) {
          if (field === 'name') {
            return { ...item, name: e.target.value };
          } else {
            const rawValue = e.target.value.replace(/\./g, '');
             if (/^\d*$/.test(rawValue) && rawValue.length <= 9) {
              const numValue = Number(rawValue);
              return { ...item, value: numValue };
            }
          }
        }
        return item;
      })
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyForWA = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const handleSendWhatsApp = () => {
    if (isDirty) {
      toast({
        title: 'Simpan Perubahan Dahulu',
        description: 'Anda memiliki perubahan yang belum disimpan. Silakan simpan laporan sebelum mengirimnya via WhatsApp.',
        variant: 'destructive',
      });
      return;
    }

    const reportDate = date ? format(date, 'dd-MM-yyyy') : 'Belum diisi';
    const reportShift = shift.charAt(0).toUpperCase() + shift.slice(1);

    const pemasukanItems = [
      { label: 'Go Food', value: goFood },
      { label: 'Grab Food', value: grabFood },
      { label: 'Shopee Food', value: shopeeFood },
      { label: 'Qris Mandiri', value: qrisMandiri },
      { label: 'Qris Bri', value: qrisBri },
      { label: 'Debit Mandiri', value: debitMandiri },
      { label: 'Debit Bri', value: debitBri },
      ...extraPemasukan.map(item => ({ label: item.name, value: item.value }))
    ]
    .filter(item => item.value > 0);

    const pemasukanText = pemasukanItems.map(item => 
      `╠➢ \`\`\`${item.label.padEnd(14, ' ')}: Rp ${formatCurrencyForWA(item.value)}\`\`\``
    ).join('\n');
    
    const message = `
╔══════════════════════════╗
║ *Tanggal       : ${reportDate}*
║ *Shift            : ${reportShift}*
║ *Omset         : Rp ${formatCurrencyForWA(omsetKotor)}*
╠══════════════════════════╣
${pemasukanText}
╠══════════════════════════╣
║ *Jumlah        : Rp ${formatCurrencyForWA(totalPengeluaran)}*
╠══════════════════════════╣
║                   ᶜᵒᵖʸʳⁱᵍʰᵗ ©ag64462
╚══════════════════════════╝
    `.trim();

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const SummaryRow = ({ label, value, isBold = false, isDestructive = false, isPositive = false }: { label: string, value: string, isBold?: boolean, isDestructive?: boolean, isPositive?: boolean }) => (
    <div className={cn("flex justify-between items-center")}>
      <Label className={cn("text-sm", isBold && "font-semibold")}>{label}</Label>
      <div className={cn(
        "text-sm font-semibold text-right",
        isBold && "text-base font-bold",
        isDestructive && "text-destructive",
        isPositive && "text-green-600 dark:text-green-500"
      )}>
        {value}
      </div>
    </div>
  );
  
  if (isLoading || isLoadingAccess) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!hasAccess) {
    return null; // The hook handles redirection
  }

  const showUpdateButton = isExistingReport && isDirty;

  return (
    <>
      <UnsavedChangesDialog />
      <div className="space-y-4 p-4 md:p-6">
        <Card className="mx-1.5 md:mx-2 relative">
          {isFetchingReport && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Memuat data laporan...</span>
            </div>
          )}
          <CardHeader>
            <CardTitle>Laporan Keuangan Harian</CardTitle>
            <CardDescription>
              Isi formulir di bawah ini untuk mencatat laporan keuangan harian Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date and Shift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pilih Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'dd MMMM yyyy', { locale: id }) : <span>Pilih tanggal</span>}
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
              <div className="space-y-2">
                <Label>Pilih Shift</Label>
                <Tabs
                  defaultValue="pagi"
                  className="w-full pt-2"
                  onValueChange={(value) => setShift(value as 'pagi' | 'sore')}
                  value={shift}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pagi">Pagi</TabsTrigger>
                    <TabsTrigger value="sore">Sore</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Separator />

            {/* Main Financials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="modalAwal">Modal Awal</Label>
                <Input id="modalAwal" type="text" inputMode="numeric" placeholder="0" value={formatValue(modalAwal)} onChange={handleNumericInputChange(setModalAwal)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="omsetBersih">Omset Bersih</Label>
                <Input id="omsetBersih" type="text" inputMode="numeric" placeholder="0" value={formatValue(omsetBersih)} onChange={handleNumericInputChange(setOmsetBersih)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pajak">Pajak</Label>
                <Input id="pajak" type="text" inputMode="numeric" placeholder="0" value={formatValue(pajak)} onChange={handleNumericInputChange(setPajak)} />
              </div>
              <div className="space-y-2">
                <Label>Omset Kotor</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold">
                  {formatCurrency(omsetKotor)}
                </div>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Pemasukan Online</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2"><Label>GoFood</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(goFood)} onChange={handleNumericInputChange(setGoFood)} /></div>
                    <div className="space-y-2"><Label>GrabFood</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(grabFood)} onChange={handleNumericInputChange(setGrabFood)} /></div>
                    <div className="space-y-2"><Label>ShopeeFood</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(shopeeFood)} onChange={handleNumericInputChange(setShopeeFood)} /></div>
                    <div className="space-y-2"><Label>Qris Mandiri</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(qrisMandiri)} onChange={handleNumericInputChange(setQrisMandiri)} /></div>
                    <div className="space-y-2"><Label>Qris Bri</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(qrisBri)} onChange={handleNumericInputChange(setQrisBri)} /></div>
                    <div className="space-y-2"><Label>Debit Mandiri</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(debitMandiri)} onChange={handleNumericInputChange(setDebitMandiri)} /></div>
                    <div className="space-y-2"><Label>Debit Bri</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(debitBri)} onChange={handleNumericInputChange(setDebitBri)} /></div>
                  </div>
                  {extraPemasukan.map(field => (
                    <div key={field.id} className="flex items-end gap-2">
                      <div className="flex-1 space-y-2"><Label>Nama Pemasukan</Label><Input value={field.name} placeholder="cth: Transfer Bank" onChange={(e) => handleExtraFieldChange('pemasukan', field.id, 'name', e)} /></div>
                      <div className="flex-1 space-y-2"><Label>Jumlah</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(field.value)} onChange={(e) => handleExtraFieldChange('pemasukan', field.id, 'value', e)} /></div>
                      <Button variant="ghost" size="icon" onClick={() => confirmRemoveExtraField('pemasukan', field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleAddExtraField('pemasukan')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Pemasukan</Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Pengeluaran Offline</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2"><Label>Transport</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(transport)} onChange={handleNumericInputChange(setTransport)} /></div>
                    <div className="space-y-2"><Label>Gosend</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(goSend)} onChange={handleNumericInputChange(setGoSend)} /></div>
                    <div className="space-y-2"><Label>Iuran Bulanan</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(iuranBulanan)} onChange={handleNumericInputChange(setIuranBulanan)} /></div>
                    <div className="space-y-2"><Label>Bonus</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(bonus)} onChange={handleNumericInputChange(setBonus)} /></div>
                    <div className="space-y-2"><Label>Lembur</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(lembur)} onChange={handleNumericInputChange(setLembur)} /></div>
                  </div>
                  {extraPengeluaran.map(field => (
                    <div key={field.id} className="flex items-end gap-2">
                      <div className="flex-1 space-y-2"><Label>Nama Pengeluaran</Label><Input value={field.name} placeholder="cth: Beli Gas" onChange={(e) => handleExtraFieldChange('pengeluaran', field.id, 'name', e)} /></div>
                      <div className="flex-1 space-y-2"><Label>Jumlah</Label><Input type="text" inputMode="numeric" placeholder="0" value={formatValue(field.value)} onChange={(e) => handleExtraFieldChange('pengeluaran', field.id, 'value', e)} /></div>
                      <Button variant="ghost" size="icon" onClick={() => confirmRemoveExtraField('pengeluaran', field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleAddExtraField('pengeluaran')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengeluaran</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />
            
            {/* Totals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ringkasan Keuangan</h3>
              <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                  <SummaryRow label="Modal Awal" value={formatCurrency(modalAwal)} />
                  <Separator className="my-2" />
                  <SummaryRow label="Omset Bersih" value={formatCurrency(omsetBersih)} />
                  <SummaryRow label="Pajak" value={formatCurrency(pajak)} />
                  <SummaryRow label="Omset Kotor" value={formatCurrency(omsetKotor)} isBold />
                  <Separator className="my-2" />
                  <SummaryRow label="Pemasukan Online" value={formatCurrency(totalPemasukanOnline)} />
                  <SummaryRow label="Pengeluaran Offline" value={formatCurrency(totalPengeluaranOffline)} />
                  <Separator className="my-2" />
                  <SummaryRow label="Total Pengeluaran" value={formatCurrency(totalPengeluaran)} isDestructive />
                  <SummaryRow label="Sisa Omset" value={formatCurrency(sisaOmset)} isBold />
                  <SummaryRow label="Omset + Pajak" value={formatCurrency(sisaOmsetPlusPajak)} isBold isPositive />
                  <Separator className="my-2" />
                  <SummaryRow label="Total Akhir (Setor)" value={formatCurrency(totalAkhir)} isBold />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button
              className={cn(
                  "flex-1 text-white",
                  showUpdateButton ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"
              )}
              onClick={handleSaveReport}
              disabled={isSaving}
              >
               {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {showUpdateButton ? 'Update' : 'Simpan'}
                </>
              )}
            </Button>
            <Button 
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              onClick={handleSendWhatsApp}
              disabled={isDirty}
            >
              <Send className="mr-2 h-4 w-4" />
              Kirim WA
            </Button>
          </CardFooter>
        </Card>
      </div>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus item ini secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setItemToDelete(null)}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveExtraField}>Lanjutkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
