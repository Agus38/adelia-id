
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { collection, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, Loader2, Trash2, Edit, Ban, CheckCircle, ChevronDown, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type ProductStatus = 'Tersedia' | 'Gangguan';

type Product = {
  id: string; // Firestore document ID
  buyer_sku_code: string;
  product_name: string;
  price: number;
  selling_price?: number;
  status: ProductStatus;
  category: string;
  brand: string;
  seller_name: string;
};

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

export function DigitalProductManagement() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isEditModalOpen, setEditModalOpen] = React.useState(false);
  const [isMarkupModalOpen, setMarkupModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [isUpdateStatusAlertOpen, setUpdateStatusAlertOpen] = React.useState(false);
  
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [newSellingPrice, setNewSellingPrice] = React.useState('');
  const [newBulkStatus, setNewBulkStatus] = React.useState<ProductStatus | null>(null);

  const [markupType, setMarkupType] = React.useState<'percentage' | 'nominal'>('percentage');
  const [markupValue, setMarkupValue] = React.useState('');


  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(fetchedProducts);
    } catch (error) {
      toast({
        title: 'Gagal Memuat Produk',
        description: 'Tidak dapat mengambil data produk dari database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditPrice = (product: Product) => {
    setSelectedProduct(product);
    setNewSellingPrice(product.selling_price?.toString() || '');
    setEditModalOpen(true);
  };
  
  const handleUpdateStatus = async (product: Product, newStatus: ProductStatus) => {
     try {
        const productDocRef = doc(db, 'products', product.id);
        await updateDoc(productDocRef, { status: newStatus });
        toast({
            title: "Status Diperbarui",
            description: `Status untuk ${product.product_name} telah diubah menjadi ${newStatus}.`
        });
        fetchProducts(); // Refresh data
     } catch (error) {
         toast({ title: "Gagal Memperbarui", description: "Gagal memperbarui status produk.", variant: "destructive"});
     }
  }

  const handleSavePrice = async () => {
    if (!selectedProduct) return;
    try {
        const productDocRef = doc(db, 'products', selectedProduct.id);
        await updateDoc(productDocRef, { selling_price: Number(newSellingPrice) });
        toast({
            title: "Harga Jual Diperbarui",
            description: `Harga jual untuk ${selectedProduct.product_name} telah berhasil disimpan.`
        });
        fetchProducts(); // Refresh data
        setEditModalOpen(false);
    } catch(error) {
        toast({ title: "Gagal Menyimpan", description: "Gagal menyimpan harga jual.", variant: "destructive" });
    }
  };

  const handleBulkMarkup = async () => {
    const selectedProducts = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if(selectedProducts.length === 0 || !markupValue) return;
    
    const value = parseFloat(markupValue);
    if(isNaN(value) || value <= 0) {
        toast({ title: "Nilai Tidak Valid", description: "Harap masukkan nilai markup yang valid.", variant: "destructive" });
        return;
    }

    try {
        const batch = writeBatch(db);
        selectedProducts.forEach(product => {
            const productDocRef = doc(db, 'products', product.id);
            let newPrice = 0;
            if (markupType === 'percentage') {
                newPrice = product.price + (product.price * (value / 100));
            } else {
                newPrice = product.price + value;
            }
            batch.update(productDocRef, { selling_price: Math.round(newPrice) });
        });
        await batch.commit();
        toast({
            title: `Harga ${selectedProducts.length} Produk Diperbarui`,
            description: `Harga jual produk yang dipilih telah berhasil diperbarui.`
        });
        fetchProducts(); // Refresh data
        setRowSelection({}); // Clear selection
        setMarkupModalOpen(false);
        setMarkupValue('');
    } catch (error) {
        toast({ title: "Gagal Memperbarui Harga", description: "Terjadi kesalahan saat memperbarui harga jual.", variant: "destructive" });
    }
  }

  const handleDeleteSelected = () => {
    if (Object.keys(rowSelection).length === 0) return;
    setDeleteAlertOpen(true);
  };
  
  const handleUpdateStatusSelected = (status: ProductStatus) => {
    if (Object.keys(rowSelection).length === 0) return;
    setNewBulkStatus(status);
    setUpdateStatusAlertOpen(true);
  };

  const confirmDelete = async () => {
    const selectedProductIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    if(selectedProductIds.length === 0) return;

    try {
        const batch = writeBatch(db);
        selectedProductIds.forEach(id => {
            const productDocRef = doc(db, 'products', id);
            batch.delete(productDocRef);
        });
        await batch.commit();

        toast({
            title: `${selectedProductIds.length} Produk Dihapus`,
            description: "Produk yang dipilih telah berhasil dihapus dari database."
        });
        fetchProducts(); // Refresh data
        setRowSelection({}); // Clear selection
    } catch(error) {
         toast({ title: "Gagal Menghapus", description: "Terjadi kesalahan saat menghapus produk.", variant: "destructive" });
    } finally {
        setDeleteAlertOpen(false);
    }
  };
  
  const confirmUpdateStatus = async () => {
    if (!newBulkStatus) return;
    const selectedProductIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    if(selectedProductIds.length === 0) return;

    try {
      const batch = writeBatch(db);
      selectedProductIds.forEach(id => {
        const productDocRef = doc(db, 'products', id);
        batch.update(productDocRef, { status: newBulkStatus });
      });
      await batch.commit();

      toast({
          title: `Status ${selectedProductIds.length} Produk Diperbarui`,
          description: `Status produk yang dipilih telah berhasil diubah menjadi ${newBulkStatus}.`
      });
      fetchProducts(); // Refresh data
      setRowSelection({}); // Clear selection
    } catch (error) {
       toast({ title: "Gagal Memperbarui Status", description: "Terjadi kesalahan saat memperbarui status produk.", variant: "destructive" });
    } finally {
        setUpdateStatusAlertOpen(false);
        setNewBulkStatus(null);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Pilih baris"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'product_name', header: 'Nama Produk' },
    { accessorKey: 'brand', header: 'Brand' },
    { accessorKey: 'price', header: 'Harga Modal', cell: ({ row }) => formatCurrency(row.original.price) },
    { accessorKey: 'selling_price', header: 'Harga Jual', cell: ({ row }) => formatCurrency(row.original.selling_price) },
    {
      id: 'profit',
      header: 'Laba',
      cell: ({ row }) => {
        const profit = (row.original.selling_price || 0) - row.original.price;
        return <span className={profit > 0 ? 'text-green-600' : 'text-muted-foreground'}>{formatCurrency(profit)}</span>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Tersedia' ? 'default' : 'destructive'}>
          {row.original.status}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditPrice(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Harga Jual
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {product.status === 'Tersedia' ? (
                 <DropdownMenuItem onClick={() => handleUpdateStatus(product, 'Gangguan')}>
                    <Ban className="mr-2 h-4 w-4" />
                    Nonaktifkan
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUpdateStatus(product, 'Tersedia')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aktifkan
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Produk Digital</CardTitle>
        <CardDescription>
          Kelola semua produk digital yang disinkronkan dari Digiflazz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-4">
            <Input
              placeholder="Cari produk..."
              value={(table.getColumn('product_name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('product_name')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
             <div className="flex items-center gap-2">
                {Object.keys(rowSelection).length > 0 && (
                    <>
                       <Button variant="outline" size="sm" onClick={() => setMarkupModalOpen(true)}>
                           <TrendingUp className="mr-2 h-4 w-4" />
                           Update Harga ({Object.keys(rowSelection).length})
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => handleUpdateStatusSelected('Tersedia')}>
                           <CheckCircle className="mr-2 h-4 w-4" />
                           Aktifkan ({Object.keys(rowSelection).length})
                       </Button>
                       <Button variant="secondary" size="sm" onClick={() => handleUpdateStatusSelected('Gangguan')}>
                           <Ban className="mr-2 h-4 w-4" />
                           Nonaktifkan ({Object.keys(rowSelection).length})
                       </Button>
                       <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                           <Trash2 className="mr-2 h-4 w-4" />
                           Hapus ({Object.keys(rowSelection).length})
                       </Button>
                    </>
                )}
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuLabel>Filter status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {['Tersedia', 'Gangguan'].map(status => {
                         const statusFilter: string[] = table.getColumn('status')?.getFilterValue() as any || [];
                         return (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={(checked) => {
                                    const currentFilter = statusFilter || [];
                                    const newFilter = checked
                                    ? [...currentFilter, status]
                                    : currentFilter.filter(s => s !== status);
                                    table.getColumn('status')?.setFilterValue(newFilter.length ? newFilter : undefined);
                                }}
                            >
                               {status}
                            </DropdownMenuCheckboxItem>
                         )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Tidak ada hasil.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari{' '}
              {table.getFilteredRowModel().rows.length} baris dipilih.
            </div>
            <div className="flex items-center space-x-2">
               <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Selanjutnya
              </Button>
            </div>
        </div>
      </CardContent>

      <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Harga Jual</DialogTitle>
                <DialogDescription>
                    Atur harga jual untuk produk: <span className="font-semibold">{selectedProduct?.product_name}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Harga Modal (dari Digiflazz)</Label>
                    <Input value={formatCurrency(selectedProduct?.price)} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="selling_price">Harga Jual</Label>
                    <Input 
                        id="selling_price" 
                        type="number"
                        value={newSellingPrice}
                        onChange={(e) => setNewSellingPrice(e.target.value)}
                        placeholder="Masukkan harga jual"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Batal</Button>
                <Button onClick={handleSavePrice}>Simpan Harga</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={isMarkupModalOpen} onOpenChange={setMarkupModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Harga Jual Massal</DialogTitle>
                <DialogDescription>
                    Terapkan markup harga pada {Object.keys(rowSelection).length} produk yang dipilih.
                </DialogDescription>
            </DialogHeader>
            <Tabs value={markupType} onValueChange={(value) => setMarkupType(value as any)} className="pt-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="percentage"><Percent className="mr-2 h-4 w-4"/>Persentase</TabsTrigger>
                    <TabsTrigger value="nominal"><DollarSign className="mr-2 h-4 w-4"/>Nominal</TabsTrigger>
                </TabsList>
                <TabsContent value="percentage" className="space-y-4 pt-4">
                    <Label htmlFor="percentage-value">Nilai Persentase</Label>
                    <Input id="percentage-value" type="number" placeholder="Contoh: 5 untuk 5%" value={markupValue} onChange={e => setMarkupValue(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Harga Jual = Harga Modal + (Harga Modal * Persentase / 100)</p>
                </TabsContent>
                <TabsContent value="nominal" className="space-y-4 pt-4">
                    <Label htmlFor="nominal-value">Nilai Nominal</Label>
                    <Input id="nominal-value" type="number" placeholder="Contoh: 1000 untuk Rp1.000" value={markupValue} onChange={e => setMarkupValue(e.target.value)} />
                     <p className="text-xs text-muted-foreground">Harga Jual = Harga Modal + Nilai Nominal</p>
                </TabsContent>
            </Tabs>
            <DialogFooter>
                <Button variant="outline" onClick={() => setMarkupModalOpen(false)}>Batal</Button>
                <Button onClick={handleBulkMarkup}>Terapkan pada {Object.keys(rowSelection).length} Produk</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Anda yakin ingin menghapus produk?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. {Object.keys(rowSelection).length} produk yang dipilih akan dihapus secara permanen.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Ya, Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={isUpdateStatusAlertOpen} onOpenChange={setUpdateStatusAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
                <AlertDialogDescription>
                    Anda akan mengubah status {Object.keys(rowSelection).length} produk menjadi "{newBulkStatus}". Lanjutkan?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNewBulkStatus(null)}>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmUpdateStatus}>Ya, Lanjutkan</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </Card>
  );
}
