
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">Manajemen Stok Harian</h2>
        <p className="text-sm text-muted-foreground">Catat stok pagi, sore, dan pesanan untuk setiap barang.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
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

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px] px-2 text-center py-1 border-r">NO</TableHead>
                <TableHead className="px-2 py-1 border-r">BARANG</TableHead>
                <TableHead className="w-[120px] px-2 py-1 border-r">PAGI</TableHead>
                <TableHead className="w-[120px] px-2 py-1 border-r">SORE</TableHead>
                <TableHead className="w-[120px] px-2 py-1">ORDER</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stockData.map((item, index) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium text-center px-2 py-1 border-r">{index + 1}</TableCell>
                    <TableCell className="px-2 py-1 border-r">{item.name}</TableCell>
                    <TableCell className="px-2 py-1 border-r">
                    <Input 
                        value={item.morning} 
                        onChange={(e) => handleStockChange(item.id, 'morning', e.target.value)}
                        className="h-7"
                    />
                    </TableCell>
                    <TableCell className="px-2 py-1 border-r">
                    <Input 
                        value={item.afternoon} 
                        onChange={(e) => handleStockChange(item.id, 'afternoon', e.target.value)}
                        className="h-7"
                    />
                    </TableCell>
                    <TableCell className="px-2 py-1">
                        <Input 
                        value={item.order} 
                        onChange={(e) => handleStockChange(item.id, 'order', e.target.value)}
                        className="h-7"
                    />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-4">
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
