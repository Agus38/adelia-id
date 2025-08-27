
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
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

type Product = {
  buyer_sku_code: string;
  product_name: string;
  price: number;
  status: 'Tersedia' | 'Gangguan';
  category: string;
  brand: string;
  seller_name: string;
};

interface GroupedProducts {
  pulsa: Record<string, Product[]>;
  paketData: Record<string, Product[]>;
  tokenListrik: Product[];
  game: Record<string, Product[]>;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ProductTable = ({ products, isLoading }: { products: Product[], isLoading: boolean }) => (
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
        {isLoading ? (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
            </TableRow>
        ) : products.length > 0 ? products.map((product) => (
          <TableRow key={product.buyer_sku_code}>
            <TableCell className="font-mono">{product.buyer_sku_code}</TableCell>
            <TableCell className="font-medium">{product.product_name}</TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell>
              <Badge variant={product.status === 'Tersedia' ? 'default' : 'destructive'}>
                {product.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch defaultChecked={true} aria-label={`Aktifkan ${product.product_name}`} />
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
        )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada produk untuk sub-kategori ini.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

const SubCategoryTabs = ({ categoryData, isLoading }: { categoryData: Record<string, Product[]>, isLoading: boolean }) => {
    const subCategories = Object.keys(categoryData);
    
    if (isLoading && !subCategories.length) {
       return <ProductTable products={[]} isLoading={true} />;
    }

    if (!subCategories.length) {
        return (
             <div className="text-center text-muted-foreground p-10 bg-muted/50 rounded-lg">
                Tidak ada data produk yang ditemukan untuk kategori ini.
            </div>
        )
    }

    return (
        <Tabs defaultValue={subCategories[0]} className="w-full">
            <TabsList>
                {subCategories.map(subCategory => (
                     <TabsTrigger key={subCategory} value={subCategory}>{subCategory}</TabsTrigger>
                ))}
            </TabsList>
            {subCategories.map(subCategory => (
                <TabsContent key={subCategory} value={subCategory} className="pt-4">
                    <ProductTable products={categoryData[subCategory]} isLoading={false} />
                </TabsContent>
            ))}
        </Tabs>
    )
};


export function DigitalProductManagement() {
  const [products, setProducts] = React.useState<GroupedProducts>({ pulsa: {}, paketData: {}, tokenListrik: [], game: {} });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ buyer_sku_code: doc.id, ...doc.data() } as Product);
        });

        // Group products by category and brand
        const grouped: GroupedProducts = { pulsa: {}, paketData: {}, tokenListrik: [], game: {} };
        fetchedProducts.forEach(p => {
            const category = p.category.toLowerCase();
            const brand = p.brand;
            if (category === 'pulsa') {
                if (!grouped.pulsa[brand]) grouped.pulsa[brand] = [];
                grouped.pulsa[brand].push(p);
            } else if (category === 'data') {
                 if (!grouped.paketData[brand]) grouped.paketData[brand] = [];
                 grouped.paketData[brand].push(p);
            } else if (category === 'pln') {
                 grouped.tokenListrik.push(p);
            } else if (category === 'games') {
                 if (!grouped.game[brand]) grouped.game[brand] = [];
                 grouped.game[brand].push(p);
            }
        });
        
        // Sort brands within categories
        Object.keys(grouped.pulsa).forEach(brand => grouped.pulsa[brand].sort((a,b) => a.price - b.price));
        Object.keys(grouped.paketData).forEach(brand => grouped.paketData[brand].sort((a,b) => a.price - b.price));
        Object.keys(grouped.game).forEach(brand => grouped.game[brand].sort((a,b) => a.price - b.price));
        grouped.tokenListrik.sort((a,b) => a.price - b.price);


        setProducts(grouped);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
            title: "Gagal Memuat Produk",
            description: "Tidak dapat mengambil data produk dari database.",
            variant: "destructive"
        })
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);


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
            <SubCategoryTabs categoryData={products.pulsa} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="paketData" className="pt-6">
            <SubCategoryTabs categoryData={products.paketData} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="tokenListrik" className="pt-6">
            <ProductTable products={products.tokenListrik} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="game" className="pt-6">
             <SubCategoryTabs categoryData={products.game} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
