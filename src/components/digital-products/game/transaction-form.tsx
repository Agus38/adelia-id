'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, Wallet, Gamepad2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

interface FirestoreProduct {
  buyer_sku_code: string;
  product_name: string;
  price: number;
  status: 'Tersedia' | 'Gangguan';
  category: string;
  brand: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function GameTransactionForm() {
    const [allGameProducts, setAllGameProducts] = useState<FirestoreProduct[]>([]);
    const [gameBrands, setGameBrands] = useState<string[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [displayedProducts, setDisplayedProducts] = useState<FirestoreProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<FirestoreProduct | null>(null);
    const [userId, setUserId] = useState('');
    const [zoneId, setZoneId] = useState('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchGameProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const q = query(collection(db, "products"), where("category", "==", "Games"));
                const querySnapshot = await getDocs(q);
                const products: FirestoreProduct[] = [];
                const brands = new Set<string>();
                querySnapshot.forEach((doc) => {
                    const productData = { buyer_sku_code: doc.id, ...doc.data() } as FirestoreProduct;
                    products.push(productData);
                    brands.add(productData.brand);
                });
                setAllGameProducts(products);
                setGameBrands(Array.from(brands).sort());
            } catch (error) {
                toast({
                    title: "Gagal Memuat Game",
                    description: "Tidak dapat mengambil data produk game dari database.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingProducts(false);
            }
        };
        fetchGameProducts();
    }, []);
    
    useEffect(() => {
        if(selectedBrand) {
            const filtered = allGameProducts.filter(p => p.brand === selectedBrand && p.status === 'Tersedia');
            filtered.sort((a,b) => a.price - b.price);
            setDisplayedProducts(filtered);
            setSelectedProduct(null);
        } else {
            setDisplayedProducts([]);
        }
    }, [selectedBrand, allGameProducts]);

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gamepad2 /> Top Up Game</CardTitle>
                <CardDescription>Pilih game, masukkan ID, dan pilih item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="game-brand">Pilih Game</Label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={isLoadingProducts}>
                        <SelectTrigger id="game-brand">
                            <SelectValue placeholder={isLoadingProducts ? "Memuat game..." : "Pilih game"}/>
                        </SelectTrigger>
                        <SelectContent>
                            {gameBrands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                 {selectedBrand && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-id">User ID</Label>
                            <Input id="user-id" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Masukkan User ID"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="zone-id">Zone ID (Opsional)</Label>
                            <Input id="zone-id" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="Masukkan Zone ID"/>
                        </div>
                    </div>
                )}

                {isLoadingProducts && selectedBrand ? (
                     <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <Label>Pilih Item</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           {displayedProducts.map(product => (
                                <button
                                    key={product.buyer_sku_code}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${
                                        selectedProduct?.buyer_sku_code === product.buyer_sku_code
                                            ? 'border-primary ring-2 ring-primary bg-primary/10'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">{product.product_name.replace(product.brand, '').trim()}</p>
                                    <p className="text-xs text-primary">{formatCurrency(product.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : selectedBrand ? (
                     <div className="text-center text-muted-foreground p-4 bg-muted rounded-lg">
                        Produk untuk {selectedBrand} belum tersedia.
                    </div>
                ) : null}
            </CardContent>
            <CardFooter>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button className="w-full" disabled={!userId || !selectedProduct}>
                            Beli Sekarang
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-lg">
                        <SheetHeader className="text-left">
                        <SheetTitle>Konfirmasi Transaksi</SheetTitle>
                        <SheetDescription>
                            Harap periksa kembali rincian transaksi Anda sebelum melanjutkan.
                        </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <Separator />
                             <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Game</span>
                                    <span className="font-medium">{selectedBrand}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">User ID</span>
                                    <span className="font-medium">{userId} {zoneId ? `(${zoneId})` : ''}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Item</span>
                                    <span className="font-medium">{selectedProduct?.product_name}</span>
                                </div>
                             </div>
                            <Separator />
                             <div className="flex justify-between items-center text-base font-bold p-3 bg-muted rounded-lg">
                                <span>Total Pembayaran</span>
                                <span className="text-primary">{selectedProduct ? formatCurrency(selectedProduct.price) : 'Rp 0'}</span>
                             </div>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" className="w-full">Batal</Button>
                            </SheetClose>
                             <Link href="/payment" className="w-full">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                   <Wallet className="mr-2 h-4 w-4" /> Konfirmasi & Bayar
                                </Button>
                            </Link>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </CardFooter>
        </Card>
    )
}
