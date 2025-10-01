'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya'];
const expenseCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Lainnya'];

export function AddTransactionDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    // Mock saving logic
    setTimeout(() => {
      toast({
        title: 'Transaksi Disimpan',
        description: 'Transaksi baru telah berhasil ditambahkan.',
      });
      setIsSaving(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue="expense" className="w-full">
          <DialogHeader className="mb-4">
            <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            <DialogDescription>
              Pilih jenis transaksi dan isi detail di bawah ini.
            </DialogDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
              <TabsTrigger value="income">Pemasukan</TabsTrigger>
            </TabsList>
          </DialogHeader>
          
          <TabsContent value="expense" className="space-y-4">
            <TransactionForm type="expense" categories={expenseCategories} onSave={handleSave} isSaving={isSaving} />
          </TabsContent>
          <TabsContent value="income" className="space-y-4">
            <TransactionForm type="income" categories={incomeCategories} onSave={handleSave} isSaving={isSaving} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface TransactionFormProps {
  type: 'income' | 'expense';
  categories: string[];
  onSave: () => void;
  isSaving: boolean;
}

function TransactionForm({ type, categories, onSave, isSaving }: TransactionFormProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${type}-description`}>Deskripsi</Label>
        <Input id={`${type}-description`} placeholder={`Contoh: Beli makan siang`} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-amount`}>Jumlah</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Rp
          </span>
          <Input id={`${type}-amount`} type="text" inputMode='numeric' placeholder="0" className="pl-8" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-category`}>Kategori</Label>
        <Select>
          <SelectTrigger id={`${type}-category`}>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
            <Label htmlFor={`${type}-date`}>Tanggal Transaksi</Label>
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
                  {date ? format(date, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={id} />
              </PopoverContent>
            </Popover>
        </div>
      <DialogFooter className="pt-4">
        <Button onClick={onSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Transaksi
        </Button>
      </DialogFooter>
    </div>
  )
}
