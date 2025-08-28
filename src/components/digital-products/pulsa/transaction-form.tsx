
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Wallet } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";


type Operator = 'Telkomsel' | 'Indosat' | 'XL' | 'AXIS' | 'Tri' | 'Smartfren' | null;

interface FirestoreProduct {
  buyer_sku_code: string;
  product_name: string;
  price: number;
  status: 'Tersedia' | 'Gangguan';
  category: string;
  brand: string;
}

const operatorPrefixes: Record<NonNullable<Operator>, string[]> = {
  Telkomsel: ['0811', '0812', '0813', '0821', '0822', '0852', '0853', '0823', '0851'],
  Indosat: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
  XL: ['0817', '0818', '0819', '0859', '0877', '0878'],
  AXIS: ['0838', '0831', '0832', '0833'],
  Tri: ['0895', '0896', '0897', '0898', '0899'],
  Smartfren: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'],
};

const operatorLogos: Record<NonNullable<Operator>, string> = {
    Telkomsel: 'https://placehold.co/100x40.png?text=Telkomsel',
    Indosat: 'https://placehold.co/100x40.png?text=Indosat',
    XL: 'https://placehold.co/100x40.png?text=XL',
    AXIS: 'https://placehold.co/100x40.png?text=AXIS',
    Tri: 'https://placehold.co/100x40.png?text=Tri',
    Smartfren: 'https://placehold.co/100x40.png?text=Smartfren',
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function PulsaTransactionForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [detectedOperator, setDetectedOperator] = useState<Operator>(null);
    const [allPulsaProducts, setAllPulsaProducts] = useState<FirestoreProduct[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<FirestoreProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<FirestoreProduct | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchPulsaProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const q = query(collection(db, "products"), where("category", "==", "pulsa"));
                const querySnapshot = await getDocs(q);
                const products: FirestoreProduct[] = [];
                querySnapshot.forEach((doc) => {
                    products.push({ buyer_sku_code: doc.id, ...doc.data() } as FirestoreProduct);
                });
                setAllPulsaProducts(products);
            } catch (error) {
                toast({
                    title: "Gagal Memuat Produk",
                    description: "Tidak dapat mengambil data produk pulsa dari database.",
                    variant: "destructive"
                });
            } finally {
                setIsLoadingProducts(false);
            }
        };
        fetchPulsaProducts();
    }, []);

    useEffect(() => {
        if (phoneNumber.length < 4) {
            setDetectedOperator(null);
            setDisplayedProducts([]);
            setSelectedProduct(null);
            return;
        }
        
        if (isLoadingProducts) return;

        const prefix = phoneNumber.substring(0, 4);
        let foundOperator: Operator = null;
        for (const op in operatorPrefixes) {
            if (operatorPrefixes[op as NonNullable<Operator>].includes(prefix)) {
                foundOperator = op as NonNullable<Operator>;
                break;
            }
        }
        
        setDetectedOperator(foundOperator);
        setSelectedProduct(null); 

        if (foundOperator && allPulsaProducts.length > 0) {
            const filtered = allPulsaProducts.filter(
              (p) => p.brand.toUpperCase() === foundOperator!.toUpperCase()
            );
            filtered.sort((a,b) => a.price - b.price);
            setDisplayedProducts(filtered);
        } else {
            setDisplayedProducts([]);
        }

    }, [phoneNumber, allPulsaProducts, isLoadingProducts]);


    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 13) {
            setPhoneNumber(value);
        }
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Beli Pulsa</CardTitle>
                <CardDescription>Masukkan nomor tujuan untuk memulai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Handphone</Label>
                    <div className="relative">
                        <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="081234567890" 
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className="pr-28"
                        />
                         <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-2 text-sm text-muted-foreground h-8 px-2 rounded-md bg-muted">
                             {detectedOperator && (
                                <>
                                    <Image src={operatorLogos[detectedOperator]} alt={detectedOperator} width={20} height={20} className="h-5 w-auto" data-ai-hint={`${detectedOperator} logo`}/>
                                    <span>{detectedOperator}</span>
                                </>
                             )}
                             {!detectedOperator && phoneNumber.length > 3 && (
                                <span className="text-destructive">Tidak Dikenal</span>
                             )}
                        </div>
                    </div>
                </div>

                {isLoadingProducts && phoneNumber.length >=4 ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : detectedOperator && displayedProducts.length > 0 ? (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <Label>Pilih Nominal</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {displayedProducts.map(product => (
                                <button
                                    key={product.buyer_sku_code}
                                    onClick={() => setSelectedProduct(product)}
                                    disabled={product.status === 'Gangguan'}
                                    className={`relative p-3 border rounded-lg text-left transition-colors ${
                                        selectedProduct?.buyer_sku_code === product.buyer_sku_code
                                            ? 'border-primary ring-2 ring-primary bg-primary/10'
                                            : 'hover:bg-muted/50'
                                    } ${product.status === 'Gangguan' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                     {product.status === 'Gangguan' && (
                                        <Badge variant="destructive" className="absolute -top-2 -right-2">Gangguan</Badge>
                                    )}
                                    <p className="font-semibold text-sm">{product.product_name.replace('Pulsa ', '').replace(product.brand, '').trim()}</p>
                                    <p className="text-xs text-primary">{formatCurrency(product.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : detectedOperator && !isLoadingProducts && displayedProducts.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 bg-muted rounded-lg">
                        Produk untuk operator {detectedOperator} belum tersedia.
                    </div>
                ) : null}
            </CardContent>
            <CardFooter>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button className="w-full" disabled={!phoneNumber || !selectedProduct}>
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
                                    <span className="text-muted-foreground">Nomor Tujuan</span>
                                    <span className="font-medium">{phoneNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Operator</span>
                                    <span className="font-medium">{detectedOperator}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Produk</span>
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
