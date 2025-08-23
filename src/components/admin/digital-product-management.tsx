
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

// Mock data, to be replaced with API data from Digiflazz
const mockProducts = {
  pulsa: [
    { id: 'p5', name: 'Telkomsel 5.000', price: 5200, status: 'Tersedia' },
    { id: 'p10', name: 'Telkomsel 10.000', price: 10150, status: 'Tersedia' },
    { id: 'ixl10', name: 'XL 10.000', price: 10500, status: 'Gangguan' },
  ],
  paketData: [
    { id: 'd1', name: 'Internet 1GB/7 Hari', price: 15000, status: 'Tersedia' },
    { id: 'd5', name: 'Internet 5GB/30 Hari', price: 50000, status: 'Tersedia' },
  ],
  tokenListrik: [
    { id: 'pln20', name: 'Token Listrik 20.000', price: 20000, status: 'Tersedia' },
    { id: 'pln50', name: 'Token Listrik 50.000', price: 50000, status: 'Tersedia' },
  ],
  game: [
    { id: 'ml100', name: 'Mobile Legends 100 Diamond', price: 28000, status: 'Tersedia' },
    { id: 'uc60', name: 'PUBG Mobile 60 UC', price: 14500, status: 'Tersedia' },
  ],
};

type Product = {
  id: string;
  name: string;
  price: number;
  status: 'Tersedia' | 'Gangguan';
};

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ProductTable = ({ products }: { products: Product[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode Produk</TableHead>
          <TableHead>Nama Produk</TableHead>
          <TableHead>Harga Modal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aktif</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-mono">{product.id}</TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell>
              <Badge variant={product.status === 'Tersedia' ? 'default' : 'destructive'}>
                {product.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch defaultChecked={true} aria-label={`Aktifkan ${product.name}`} />
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
                    <DropdownMenuItem>Edit Harga Jual</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export function DigitalProductManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Produk Digital</CardTitle>
        <CardDescription>
          Lihat produk yang disinkronkan dari Digiflazz dan kelola ketersediaannya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pulsa" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="pulsa">Pulsa</TabsTrigger>
            <TabsTrigger value="paketData">Paket Data</TabsTrigger>
            <TabsTrigger value="tokenListrik">Token Listrik</TabsTrigger>
            <TabsTrigger value="game">Game</TabsTrigger>
          </TabsList>
          <TabsContent value="pulsa" className="pt-6">
            <ProductTable products={mockProducts.pulsa} />
          </TabsContent>
          <TabsContent value="paketData" className="pt-6">
            <ProductTable products={mockProducts.paketData} />
          </TabsContent>
          <TabsContent value="tokenListrik" className="pt-6">
            <ProductTable products={mockProducts.tokenListrik} />
          </TabsContent>
          <TabsContent value="game" className="pt-6">
            <ProductTable products={mockProducts.game} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
