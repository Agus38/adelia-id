
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { getStockReport, addOrUpdateStockReport, type StockItem, initialStockData } from '@/lib/stock-store';
import { usePageAccess } from '@/hooks/use-page-access';
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes-warning';


// Memoize the input component to prevent unnecessary re-renders causing focus loss.
const DynamicWidthInput = React.memo(function DynamicWidthInput({
    value,
    onChange,
    onKeyDown,
    maxLength,
    placeholder,
    id,
}: {
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    maxLength: number,
    placeholder: string,
    id: string,
}) {
    return (
        <div className="dynamic-input-wrapper">
            <Input
                id={id}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-[11px] p-0 m-0 w-full text-center"
                maxLength={maxLength}
                onFocus={(e) => e.target.scrollIntoView({ block: 'center', inline: 'nearest' })}
            />
            <span className="dynamic-input-sizer">{value || placeholder}</span>
        </div>
    );
});


export default function StokProdukPage() {
  const { hasAccess, isLoading: isLoadingAccess } = usePageAccess('stok-produk');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [shift, setShift] = React.useState<'pagi' | 'sore'>('pagi');
  const [stockData, setStockData] = React.useState<StockItem[]>(initialStockData);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = React.useState(true);
  const [isFetchingReport, setIsFetchingReport] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const { toast } = useToast();
  const { UnsavedChangesDialog } = useUnsavedChangesWarning(isDirty);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = React.useCallback(() => {
    setStockData(initialStockData.map(item => ({...item, morning: '', afternoon: '', order: ''})));
    setIsDirty(false);
  }, []);

  const populateForm = React.useCallback((report: { stockData: StockItem[] }) => {
     // Create a map of the new stock data for quick lookup
    const newStockMap = new Map(report.stockData.map(item => [item.id, item]));
    // Create a new array, preserving the order of initialStockData
    const updatedStockData = initialStockData.map(initialItem => {
        const newStockItem = newStockMap.get(initialItem.id);
        return newStockItem ? { ...initialItem, ...newStockItem } : initialItem;
    });
    setStockData(updatedStockData);
    setIsDirty(false);
  }, []);

  React.useEffect(() => {
    if (!date || !currentUser) return;

    const fetchReport = async () => {
      setIsFetchingReport(true);
      try {
        const report = await getStockReport(date, shift, currentUser.uid);
        if (report) {
          populateForm(report);
        } else {
          resetForm();
        }
      } catch (error) {
         toast({
          title: 'Gagal Memuat Stok',
          description: 'Terjadi kesalahan saat mengambil data dari database.',
          variant: 'destructive',
        });
        resetForm();
      } finally {
        setIsFetchingReport(false);
      }
    };

    fetchReport();
  }, [date, shift, currentUser, resetForm, populateForm, toast]);


  const handleStockChange = React.useCallback((id: number, field: 'morning' | 'afternoon' | 'order', value: string) => {
    setIsDirty(true);
    setStockData(prevStockData =>
      prevStockData.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);


  const handleClear = () => {
    resetForm();
  }

  const handleSaveStock = async () => {
    if (!date || !currentUser) {
       toast({
        title: 'Data Tidak Lengkap',
        description: 'Pastikan tanggal telah dipilih dan Anda sudah login.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
        const reportData = {
          date,
          shift,
          stockData,
          createdBy: currentUser.displayName || 'Pengguna',
          userId: currentUser.uid,
        };

        await addOrUpdateStockReport(reportData);
        
        toast({
          title: 'Stok Disimpan!',
          description: 'Laporan stok produk telah berhasil disimpan di database.',
        });
        setIsDirty(false);
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

  const getTableHeaders = () => {
    if (shift === 'pagi') {
      return { header1: 'KULKAS', header2: 'PAGI' };
    }
    return { header1: 'PAGI', header2: 'SORE' };
  };

  const { header1, header2 } = getTableHeaders();

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, field: 'morning' | 'afternoon' | 'order') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex < stockData.length) {
        const nextInput = document.getElementById(`input-${nextRowIndex}-${field}`);
        nextInput?.focus();
      }
    }
  }, [stockData.length]);


  if (isLoadingUser || isLoadingAccess) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  if (!hasAccess) {
    return null; // The hook handles redirection
  }

  return (
    <div className="flex flex-col flex-1 p-4 pt-6 md:p-8 space-y-4 relative">
       <UnsavedChangesDialog />
       {isFetchingReport && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Memuat data stok...</span>
            </div>
        )}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4">
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
                  className="w-full"
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
      </div>

       <div className="text-center font-bold">
        SOTO MERR
      </div>
       <div className="text-center text-sm text-muted-foreground -mt-3">
        {date ? format(date, 'eeee, dd MMMM yyyy', { locale: id }) : 'Memuat tanggal...'}
      </div>

      <div className="flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="text-left border-r px-2 py-2">BARANG</TableHead>
                <TableHead className="text-center border-r px-2 py-2 w-auto">{header1}</TableHead>
                <TableHead className="text-center border-r px-2 py-2 w-auto">{header2}</TableHead>
                <TableHead className="text-center px-2 py-2 w-auto">ORDER</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stockData.map((item, index) => (
                <TableRow key={item.id}>
                    <TableCell className="border-r px-2 py-1">{item.name}</TableCell>
                    <TableCell className="px-2 border-r py-1">
                      <DynamicWidthInput
                        id={`input-${index}-morning`}
                        value={item.morning}
                        onChange={(e) => handleStockChange(item.id, 'morning', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'morning')}
                        maxLength={8}
                        placeholder={header1}
                      />
                    </TableCell>
                    <TableCell className="px-2 border-r py-1">
                      <DynamicWidthInput
                        id={`input-${index}-afternoon`}
                        value={item.afternoon}
                        onChange={(e) => handleStockChange(item.id, 'afternoon', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'afternoon')}
                        maxLength={8}
                        placeholder={header2}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <DynamicWidthInput
                        id={`input-${index}-order`}
                        value={item.order}
                        onChange={(e) => handleStockChange(item.id, 'order', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'order')}
                        maxLength={15}
                        placeholder="ORDER"
                      />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
      </div>

      <div className="flex-shrink-0 flex justify-between gap-4 pt-4">
        <Button variant="destructive" onClick={handleClear} className="w-full md:w-auto">
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
        <Button className="w-full md:w-auto" onClick={handleSaveStock} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Stok
        </Button>
      </div>
    </div>
  );
}
