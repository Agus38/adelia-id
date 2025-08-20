
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Trash2 } from 'lucide-react';
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

const initialStockData = [
  { id: 1, name: 'Daging', morning: '', afternoon: '', order: '' },
  { id: 2, name: 'Babat', morning: '', afternoon: '', order: '' },
  { id: 3, name: 'Paru', morning: '', afternoon: '', order: '' },
  { id: 4, name: 'Usus', morning: '', afternoon: '', order: '' },
  { id: 5, name: 'Ati', morning: '', afternoon: '', order: '' },
  { id: 6, name: 'Otak', morning: '', afternoon: '', order: '' },
  { id: 7, name: 'Telur', morning: '', afternoon: '', order: '' },
  { id: 8, name: 'Kuah', morning: '', afternoon: '', order: '' },
  { id: 9, name: 'B-Goreng', morning: '', afternoon: '', order: '' },
  { id: 10, name: 'Seledri', morning: '', afternoon: '', order: '' },
  { id: 11, name: 'Garam', morning: '', afternoon: '', order: '' },
];

type StockItem = typeof initialStockData[0];
type StockField = 'morning' | 'afternoon' | 'order';


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
                className="h-8 bg-transparent border-0 shadow-none focus-visible:ring-0 text-[11px] p-0 m-0 w-full"
                maxLength={maxLength}
                onFocus={(e) => e.target.scrollIntoView({ block: 'center', inline: 'nearest' })}
            />
            <span className="dynamic-input-sizer">{value || placeholder}</span>
        </div>
    );
});


export default function StokProdukPage() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [shift, setShift] = React.useState('pagi');
  const [stockData, setStockData] = React.useState(initialStockData);
  
  React.useEffect(() => {
    // Set date only on client-side to avoid hydration mismatch
    setDate(new Date());
  }, []);

  const handleStockChange = (id: number, field: keyof Omit<StockItem, 'id' | 'name'>, value: string) => {
    setStockData(stockData.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleClear = () => {
    setStockData(initialStockData.map(item => ({...item, morning: '', afternoon: '', order: ''})));
  }
  
  const getTableHeaders = () => {
    if (shift === 'pagi') {
      return { header1: 'KULKAS', header2: 'PAGI' };
    }
    return { header1: 'PAGI', header2: 'SORE' };
  };

  const { header1, header2 } = getTableHeaders();
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, field: StockField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex < stockData.length) {
        const nextInput = document.getElementById(`input-${nextRowIndex}-${field}`);
        nextInput?.focus();
      }
    }
  };


  return (
    <div className="flex flex-col flex-1 p-4 pt-6 md:p-8 space-y-4">
      <div className="flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-4">
            <div className="space-y-2 md:col-span-2">
                <Label>Pilih Shift</Label>
                <Tabs
                defaultValue="pagi"
                className="w-full"
                onValueChange={setShift}
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
        <Button className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Simpan Stok
        </Button>
      </div>
    </div>
  );
}
