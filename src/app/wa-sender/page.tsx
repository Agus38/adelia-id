
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
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type ExtraField = {
  id: number;
  name: string;
  value: number;
};

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
  
  const totalPengeluaran = totalPemasukanOnline + totalPengeluaranOffline; // As per logic description

  const sisaOmset = omsetBersih - totalPengeluaran;
  const omsetPlusPajak = sisaOmset + pajak;
  const omsetPlusPajakPlusModal = sisaOmset + pajak + modalAwal;
  
  const handleAddExtraField = (type: 'pemasukan' | 'pengeluaran') => {
    const newField = { id: Date.now(), name: '', value: 0 };
    if (type === 'pemasukan') {
      setExtraPemasukan([...extraPemasukan, newField]);
    } else {
      setExtraPengeluaran([...extraPengeluaran, newField]);
    }
  };

  const handleRemoveExtraField = (type: 'pemasukan' | 'pengeluaran', id: number) => {
    if (type === 'pemasukan') {
      setExtraPemasukan(extraPemasukan.filter(field => field.id !== id));
    } else {
      setExtraPengeluaran(extraPengeluaran.filter(field => field.id !== id));
    }
  }

  const handleExtraFieldChange = (
    type: 'pemasukan' | 'pengeluaran',
    id: number,
    field: 'name' | 'value',
    value: string | number
  ) => {
    const setter = type === 'pemasukan' ? setExtraPemasukan : setExtraPengeluaran;
    const list = type === 'pemasukan' ? extraPemasukan : extraPengeluaran;

    setter(
      list.map(item =>
        item.id === id
          ? { ...item, [field]: field === 'value' ? Number(value) || 0 : value }
          : item
      )
    );
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
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
                    {date ? format(date, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
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
              <Input id="modalAwal" type="number" placeholder="Rp 0" onChange={e => setModalAwal(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="omsetBersih">Omset Bersih</Label>
              <Input id="omsetBersih" type="number" placeholder="Rp 0" onChange={e => setOmsetBersih(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pajak">Pajak</Label>
              <Input id="pajak" type="number" placeholder="Rp 0" onChange={e => setPajak(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Omset Kotor</Label>
              <Input value={formatCurrency(omsetKotor)} readOnly className="font-semibold" />
            </div>
          </div>

          <Accordion type="multiple" defaultValue={[]} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Pemasukan Online</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2"><Label>GoFood</Label><Input type="number" placeholder="Rp 0" onChange={e => setGoFood(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>GrabFood</Label><Input type="number" placeholder="Rp 0" onChange={e => setGrabFood(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>ShopeeFood</Label><Input type="number" placeholder="Rp 0" onChange={e => setShopeeFood(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Qris Mandiri</Label><Input type="number" placeholder="Rp 0" onChange={e => setQrisMandiri(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Qris Bri</Label><Input type="number" placeholder="Rp 0" onChange={e => setQrisBri(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Debit Mandiri</Label><Input type="number" placeholder="Rp 0" onChange={e => setDebitMandiri(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Debit Bri</Label><Input type="number" placeholder="Rp 0" onChange={e => setDebitBri(Number(e.target.value) || 0)} /></div>
                </div>
                 {extraPemasukan.map(field => (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2"><Label>Nama Pemasukan</Label><Input value={field.name} placeholder="cth: Transfer Bank" onChange={e => handleExtraFieldChange('pemasukan', field.id, 'name', e.target.value)} /></div>
                    <div className="flex-1 space-y-2"><Label>Jumlah</Label><Input type="number" value={field.value} placeholder="Rp 0" onChange={e => handleExtraFieldChange('pemasukan', field.id, 'value', e.target.value)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExtraField('pemasukan', field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => handleAddExtraField('pemasukan')}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Pemasukan</Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Pengeluaran Offline</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2"><Label>Transport</Label><Input type="number" placeholder="Rp 0" onChange={e => setTransport(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Gosend</Label><Input type="number" placeholder="Rp 0" onChange={e => setGoSend(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Iuran Bulanan</Label><Input type="number" placeholder="Rp 0" onChange={e => setIuranBulanan(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Bonus</Label><Input type="number" placeholder="Rp 0" onChange={e => setBonus(Number(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Lembur</Label><Input type="number" placeholder="Rp 0" onChange={e => setLembur(Number(e.target.value) || 0)} /></div>
                </div>
                {extraPengeluaran.map(field => (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2"><Label>Nama Pengeluaran</Label><Input value={field.name} placeholder="cth: Beli Gas" onChange={e => handleExtraFieldChange('pengeluaran', field.id, 'name', e.target.value)} /></div>
                    <div className="flex-1 space-y-2"><Label>Jumlah</Label><Input type="number" value={field.value} placeholder="Rp 0" onChange={e => handleExtraFieldChange('pengeluaran', field.id, 'value', e.target.value)} /></div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExtraField('pengeluaran', field.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                  <Label>Total Pengeluaran (Online + Offline)</Label>
                  <Input value={formatCurrency(totalPengeluaran)} readOnly className="font-semibold text-destructive" />
                </div>
                <div className="space-y-2">
                  <Label>Sisa Omset (Omset Bersih - Total Pengeluaran)</Label>
                  <Input value={formatCurrency(sisaOmset)} readOnly className="font-semibold" />
                </div>
                 <div className="space-y-2">
                  <Label>Omset + Pajak</Label>
                  <Input value={formatCurrency(omsetPlusPajak)} readOnly className="font-semibold" />
                </div>
                 <div className="space-y-2">
                  <Label>Omset + Pajak + Modal</Label>
                  <Input value={formatCurrency(omsetPlusPajakPlusModal)} readOnly className="font-bold text-lg" />
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button>Simpan Laporan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    