'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Wallet, Wifi } from "lucide-react";
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

type Operator = 'Telkomsel' | 'Indosat' | 'XL' | 'AXIS' | 'Tri' | 'Smartfren' | null;
type Product = { id: string; name: string; price: number; };

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

const mockProducts: Record<string, Product[]> = {
    Telkomsel: [
        { id: 'td1', name: '1GB, 7 Hari', price: 15000 },
        { id: 'td2', name: '3GB, 30 Hari', price: 35000 },
        { id: 'td5', name: '5GB, 30 Hari', price: 50000 },
    ],
    Indosat: [
        { id: 'id1', name: '2GB, 7 Hari', price: 18000 },
        { id: 'id3', name: '4GB, 30 Hari', price: 40000 },
    ],
     XL: [
        { id: 'xld2', name: '2GB, 5 Hari', price: 20000 },
        { id: 'xld10', name: '10GB, 30 Hari', price: 80000 },
    ],
};

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function PaketDataTransactionForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [operator, setOperator] = useState<Operator>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const detectOperator = () => {
            if (phoneNumber.length < 4) {
                setOperator(null);
                setProducts([]);
                setSelectedProduct(null);
                return;
            }
            
            setIsFetching(true);
            const prefix = phoneNumber.substring(0, 4);
            let foundOperator: Operator = null;
            for (const op in operatorPrefixes) {
                if (operatorPrefixes[op as NonNullable<Operator>].includes(prefix)) {
                    foundOperator = op as NonNullable<Operator>;
                    break;
                }
            }
            
            setTimeout(() => {
                setOperator(foundOperator);
                setSelectedProduct(null);
                if (foundOperator && mockProducts[foundOperator as keyof typeof mockProducts]) {
                    setProducts(mockProducts[foundOperator as keyof typeof mockProducts]);
                } else {
                    setProducts([]);
                }
                 setIsFetching(false);
            }, 500);
        };

        const timeoutId = setTimeout(detectOperator, 300);
        return () => clearTimeout(timeoutId);
    }, [phoneNumber]);


    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 13) {
            setPhoneNumber(value);
        }
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wifi /> Beli Paket Data</CardTitle>
                <CardDescription>Masukkan nomor tujuan untuk melihat paket data yang tersedia.</CardDescription>
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
                            {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
                             {operator && !isFetching && (
                                <>
                                    <Image src={operatorLogos[operator]} alt={operator} width={20} height={20} className="h-5 w-auto" data-ai-hint={`${operator} logo`}/>
                                    <span>{operator}</span>
                                </>
                             )}
                             {!operator && !isFetching && phoneNumber.length > 3 && (
                                <span className="text-destructive">Tidak Dikenal</span>
                             )}
                        </div>
                    </div>
                </div>

                {operator && products.length > 0 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <Label>Pilih Paket</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${
                                        selectedProduct?.id === product.id 
                                            ? 'border-primary ring-2 ring-primary bg-primary/10'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">{product.name.split(',')[0]}</p>
                                    <p className="text-xs text-muted-foreground">{product.name.split(',')[1]}</p>
                                    <p className="text-xs font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {operator && products.length === 0 && !isFetching && (
                    <div className="text-center text-muted-foreground p-4 bg-muted rounded-lg">
                        Produk paket data untuk {operator} belum tersedia.
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button className="w-full" disabled={!phoneNumber || !selectedProduct || isFetching}>
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
                                    <span className="font-medium">{operator}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Produk</span>
                                    <span className="font-medium">{selectedProduct?.name}</span>
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
                             <Link href="/top-up" className="w-full">
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
