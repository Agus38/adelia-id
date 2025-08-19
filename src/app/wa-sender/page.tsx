
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
import { Calendar as CalendarIcon, PlusCircle, Send, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [shift, setShift] = React.useState('pagi');

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
  
  const handleAddExtraField = (type: 'pemasukan' | 'pengeluaran') => {
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

  const SummaryRow = ({ label, value, isBold = false, isDestructive = false }: { label: string, value: string, isBold?: boolean, isDestructive?: boolean }) => (
    <div className="flex justify-between items-center">
      <Label className={cn("text-sm", isBold && "font-semibold")}>{label}</Label>
      <div className={cn(
        "text-sm font-semibold text-right",
        isBold && "text-base font-bold",
        isDestructive && "text-destructive"
      )}>
        {value}
      </div>
    </div>
  );

  return (
    <>
    <div className="flex-1 space-y-4 pt-6 px-1.5 md:px-2">
      <Card>
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
              <RadioGroup
                defaultValue="pagi"
                className="flex items-center space-x-4 pt-2"
                onValueChange={setShift}
                value={shift}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pagi" id="pagi" />
                  <Label htmlFor="pagi">Pagi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sore" id="sore" />
                  <Label htmlFor="sore">Sore</Label>
                </div>
              </RadioGroup>
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

          <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
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
                <SummaryRow label="Omset Bersih" value={formatCurrency(omsetBersih)} />
                <SummaryRow label="Pajak" value={formatCurrency(pajak)} />
                <SummaryRow label="Omset Kotor" value={formatCurrency(omsetKotor)} isBold />
                <Separator className="my-2" />
                <SummaryRow label="Pemasukan Online" value={formatCurrency(totalPemasukanOnline)} />
                <SummaryRow label="Pengeluaran Offline" value={formatCurrency(totalPengeluaranOffline)} />
                <Separator className="my-2" />
                <SummaryRow label="Total Pengeluaran" value={formatCurrency(totalPengeluaran)} isDestructive />
                <SummaryRow label="Sisa Omset" value={formatCurrency(sisaOmset)} isBold />
                <SummaryRow label="Omset + Pajak" value={formatCurrency(sisaOmsetPlusPajak)} isBold />
                <Separator className="my-2" />
                <SummaryRow label="Total Akhir (Setor)" value={formatCurrency(totalAkhir)} isBold />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button className="bg-[#4560ec] hover:bg-[#4560ec]/90 text-white">Simpan</Button>
          <Button className="bg-[#25d366] hover:bg-[#25d366]/90 text-white">
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
