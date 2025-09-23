

'use client';

import { useState, useEffect } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Loader2, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getSmwReports, deleteSmwReport, type SmwReport } from '@/lib/smw-manyar-report-store';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';

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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
};


export function SmwManyarManagement() {
  const [sisaIkanItems, setSisaIkanItems] = useState<ReportItem[]>(initialSisaIkanItems);
  const [terjualItems, setTerjualItems] = useState<ReportItem[]>(initialTerjualItems);
  const [onlineSalesItems, setOnlineSalesItems] = useState<ReportItem[]>(initialOnlineSalesItems);

  // Dialog state for item editing
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ReportItem | null>(null);
  const [currentList, setCurrentList] = useState<'sisaIkan' | 'terjual' | 'onlineSales' | null>(null);
  const [isNew, setIsNew] = useState(false);
  
  // State for report list
  const [reports, setReports] = useState<SmwReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SmwReport | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);


  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
        const fetchedReports = await getSmwReports();
        setReports(fetchedReports);
    } catch (error) {
        toast({ title: "Gagal Memuat Laporan", description: "Terjadi kesalahan saat mengambil laporan dari database.", variant: "destructive"});
    } finally {
        setIsLoadingReports(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

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
    const { setter, list } = getListAndSetter(listName);
    setter(list.filter(item => item.id !== id));
    toast({ title: "Item Dihapus", description: "Item telah berhasil dihapus dari daftar."});
  }

  const handleSaveItem = () => {
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
  
  const handleViewDetails = (report: SmwReport) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const handleDeleteReport = (report: SmwReport) => {
    setSelectedReport(report);
    setDeleteOpen(true);
  };

  const confirmDeleteReport = async () => {
    if (!selectedReport) return;
    try {
        await deleteSmwReport(selectedReport.id);
        toast({ title: "Laporan Dihapus", description: "Laporan SMW Manyar telah berhasil dihapus."});
        fetchReports(); // Refresh the list
    } catch (error) {
        toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus laporan.", variant: "destructive"});
    } finally {
        setDeleteOpen(false);
    }
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
  
  const DetailSection = ({ title, items, data }: { title: string, items: ReportItem[], data: { [key: string]: string }}) => {
    const total = items.reduce((sum, item) => sum + (Number(data[item.id]) || 0), 0);
    const hasItems = items.some(item => data[item.id] && Number(data[item.id]) > 0);
    return (
        <div className="space-y-2">
            <h3 className="font-semibold">{title}</h3>
            <div className="p-4 border rounded-lg">
                <Table>
                    <TableBody>
                        {hasItems ? items.map((item) => {
                            const value = data[item.id];
                            if (!value || Number(value) === 0) return null;
                            return (
                                <TableRow key={item.id} className="border-none">
                                    <TableCell className="p-1">{item.label}</TableCell>
                                    <TableCell className="p-1 text-right font-medium">{title.includes('Sales') ? formatCurrency(Number(value)) : value}</TableCell>
                                </TableRow>
                            )
                        }) : (
                             <TableRow className="border-none"><TableCell colSpan={2} className="text-center text-muted-foreground p-1">Tidak ada data</TableCell></TableRow>
                        )}
                        {title.includes('Sales') && (
                            <TableRow className="font-bold border-t">
                                <TableCell className="p-1">Total</TableCell>
                                <TableCell className="p-1 text-right">{formatCurrency(total)}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
  };


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Laporan SMW Manyar</CardTitle>
        <CardDescription>
          Kelola item formulir laporan dan lihat daftar laporan yang telah dikirimkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="report-list" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="report-list">Daftar Laporan</TabsTrigger>
            <TabsTrigger value="sisa-ikan">Item Sisa Ikan</TabsTrigger>
            <TabsTrigger value="item-terjual">Item Terjual</TabsTrigger>
            <TabsTrigger value="penjualan-online">Item Penjualan Online</TabsTrigger>
          </TabsList>
           <TabsContent value="report-list" className="pt-6">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Dibuat Oleh</TableHead>
                                <TableHead>Waktu Kirim</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingReports ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Belum ada laporan yang dibuat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">
                                            {format(report.date, 'eeee, d MMMM yyyy', { locale: id })}
                                        </TableCell>
                                        <TableCell>{report.createdBy}</TableCell>
                                         <TableCell className="text-muted-foreground">
                                            {format(report.createdAt, 'HH:mm', { locale: id })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Buka menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteReport(report)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
          </TabsContent>
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
            <Button type="submit" onClick={handleSaveItem}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Laporan untuk tanggal <span className="font-semibold">{selectedReport ? format(selectedReport.date, 'd MMM yyyy', {locale: id}) : ''}</span> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReport}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Detail Laporan SMW Manyar</DialogTitle>
                <DialogDescription>
                    Laporan dibuat oleh <strong>{selectedReport?.createdBy}</strong> pada <strong>{selectedReport ? format(selectedReport.date, 'd MMM yyyy', {locale: id}) : ''}</strong>.
                </DialogDescription>
            </DialogHeader>
            {selectedReport && (
                <div className="space-y-6 pt-4 max-h-[60vh] overflow-y-auto pr-4 text-sm">
                    <DetailSection 
                        title="Sisa Ikan" 
                        items={sisaIkanItems} 
                        data={Object.fromEntries(Object.entries(selectedReport.formData).filter(([k]) => k.startsWith('sisa-')).map(([k,v]) => [k.replace('sisa-',''), v]))} 
                    />
                     <DetailSection 
                        title="Item Terjual" 
                        items={terjualItems} 
                        data={Object.fromEntries(Object.entries(selectedReport.formData).filter(([k]) => k.startsWith('terjual-')).map(([k,v]) => [k.replace('terjual-',''), v]))} 
                    />
                    <DetailSection 
                        title="Total Online Sales" 
                        items={onlineSalesItems} 
                        data={Object.fromEntries(Object.entries(selectedReport.formData).filter(([k]) => k.startsWith('online-')).map(([k,v]) => [k.replace('online-',''), v]))} 
                    />
                </div>
            )}
             <DialogFooter className="pt-4 border-t">
                <Button variant="secondary" onClick={() => setDetailOpen(false)}>
                    Tutup
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
