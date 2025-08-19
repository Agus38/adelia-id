
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, Trash2, Package } from 'lucide-react';
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


  const handleStockChange = (id: number, field: keyof StockItem, value: string) => {
    setStockData(stockData.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleClear = () => {
    setStockData(initialStockData.map(item => ({...item, morning: '', afternoon: '', order: ''})));
  }

  return (
    <div className="flex-1 space-y-4 pt-6 px-1.5 md:px-2">
      <div className="flex items-center space-x-2 px-2">
        <Package className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Stok Produk</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Stok Harian</CardTitle>
          <CardDescription>Catat stok pagi, sore, dan pesanan untuk setiap barang.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">NO</TableHead>
                <TableHead>BARANG</TableHead>
                <TableHead className="w-[100px]">PAGI</TableHead>
                <TableHead className="w-[100px]">SORE</TableHead>
                <TableHead>ORDER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Input 
                      value={item.morning} 
                      onChange={(e) => handleStockChange(item.id, 'morning', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={item.afternoon} 
                      onChange={(e) => handleStockChange(item.id, 'afternoon', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                      <Input 
                      value={item.order} 
                      onChange={(e) => handleStockChange(item.id, 'order', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="flex justify-between gap-4">
          <Button variant="destructive" onClick={handleClear} className="w-1/2">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
          <Button className="w-1/2">
            <Save className="mr-2 h-4 w-4" />
            Simpan Stok
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
