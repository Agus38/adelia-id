
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ReportItem = {
  id: string;
  label: string;
};

const initialSisaIkanItems: ReportItem[] = [
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

const initialTerjualItems: ReportItem[] = [
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

const initialOnlineSalesItems: ReportItem[] = [
  { id: 'goFood', label: 'GoFood' },
  { id: 'grabFood', label: 'GrabFood' },
  { id: 'cash', label: 'Cash/Dll' },
];

export function SmwManyarManagement() {
  const [sisaIkanItems, setSisaIkanItems] = useState<ReportItem[]>(initialSisaIkanItems);
  const [terjualItems, setTerjualItems] = useState<ReportItem[]>(initialTerjualItems);
  const [onlineSalesItems, setOnlineSalesItems] = useState<ReportItem[]>(initialOnlineSalesItems);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReportItem | null>(null);
  const [currentList, setCurrentList] = useState<'sisaIkan' | 'terjual' | 'onlineSales' | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  const getListAndSetter = (listName: 'sisaIkan' | 'terjual' | 'onlineSales') => {
    switch(listName) {
        case 'sisaIkan': return { list: sisaIkanItems, setter: setSisaIkanItems };
        case 'terjual': return { list: terjualItems, setter: setTerjualItems };
        case 'onlineSales': return { list: onlineSalesItems, setter: setOnlineSalesItems };
    }
  }

  const handleAddNew = (listName: 'sisaIkan' | 'terjual' | 'onlineSales') => {
    setCurrentList(listName);
    setCurrentItem({id: '', label: ''});
    setIsNew(true);
    setDialogOpen(true);
  }

  const handleEdit = (item: ReportItem, listName: 'sisaIkan' | 'terjual' | 'onlineSales') => {
    setCurrentList(listName);
    setCurrentItem(item);
    setIsNew(false);
    setDialogOpen(true);
  };
  
  const handleDelete = (id: string, listName: 'sisaIkan' | 'terjual' | 'onlineSales') => {
    // In a real app, you'd want a confirmation dialog here.
    const { setter, list } = getListAndSetter(listName);
    setter(list.filter(item => item.id !== id));
    toast({ title: "Item Dihapus", description: "Item telah berhasil dihapus dari daftar."});
  }

  const handleSave = () => {
    if (!currentItem || !currentList) return;
    
    const { setter, list } = getListAndSetter(currentList);
    
    if (isNew) {
        const newItem = { ...currentItem, id: currentItem.label.toLowerCase().replace(/\s+/g, '-') };
        setter([...list, newItem]);
        toast({ title: "Item Ditambahkan", description: "Item baru telah berhasil ditambahkan."});
    } else {
        setter(list.map(item => item.id === currentItem.id ? currentItem : item));
        toast({ title: "Item Diperbarui", description: "Item telah berhasil diperbarui."});
    }

    setDialogOpen(false);
    setCurrentItem(null);
    setCurrentList(null);
  };

  const ItemTable = ({ items, listName, onEdit, onDelete }: { items: ReportItem[], listName: any, onEdit: any, onDelete: any }) => (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={() => handleAddNew(listName)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Item Baru
            </Button>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(item, listName)}>
                            <Edit className="h-3 w-3 mr-1"/> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(item.id, listName)}>
                            <Trash2 className="h-3 w-3 mr-1"/> Hapus
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Halaman SMW Manyar</CardTitle>
        <CardDescription>
          Sesuaikan item dan opsi yang tersedia di formulir laporan SMW Manyar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sisa-ikan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sisa-ikan">Sisa Ikan</TabsTrigger>
            <TabsTrigger value="item-terjual">Item Terjual</TabsTrigger>
            <TabsTrigger value="penjualan-online">Penjualan Online</TabsTrigger>
          </TabsList>
          <TabsContent value="sisa-ikan" className="pt-6">
            <ItemTable items={sisaIkanItems} listName="sisaIkan" onEdit={handleEdit} onDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="item-terjual" className="pt-6">
            <ItemTable items={terjualItems} listName="terjual" onEdit={handleEdit} onDelete={handleDelete} />
          </TabsContent>
          <TabsContent value="penjualan-online" className="pt-6">
            <ItemTable items={onlineSalesItems} listName="onlineSales" onEdit={handleEdit} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button>Simpan Semua Perubahan</Button>
      </CardFooter>
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Tambah Item Baru' : 'Edit Item'}</DialogTitle>
            <DialogDescription>
              {isNew ? 'Buat item baru untuk formulir laporan.' : 'Ubah detail item yang ada di bawah ini.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Label
              </Label>
              <Input
                id="label"
                value={currentItem?.label || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, label: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
             {!isNew && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">
                        ID
                    </Label>
                    <Input
                        id="id"
                        value={currentItem?.id || ''}
                        readOnly
                        disabled
                        className="col-span-3 bg-muted"
                    />
                </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
