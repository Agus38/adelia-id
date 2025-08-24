'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Bolt, Loader2, Wallet } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Product = { id: string; name: string; price: number; };

const mockProducts: Product[] = [
    { id: 'pln20', name: 'Token Listrik 20.000', price: 20000 },
    { id: 'pln50', name: 'Token Listrik 50.000', price: 50000 },
    { id: 'pln100', name: 'Token Listrik 100.000', price: 100000 },
    { id: 'pln200', name: 'Token Listrik 200.000', price: 200000 },
    { id: 'pln500', name: 'Token Listrik 500.000', price: 500000 },
    { id: 'pln1000', name: 'Token Listrik 1.000.000', price: 1000000 },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function TokenListrikTransactionForm() {
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const { toast } = useToast();

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 12) {
            setCustomerId(value);
             if (customerName) {
                setCustomerName(null);
            }
        }
    }
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length <= 13) {
            setPhoneNumber(value);
        }
    }

    const handleCheckId = () => {
        if(customerId.length < 10) {
            toast({
                title: "ID Pelanggan tidak valid",
                description: "Pastikan Anda memasukkan ID Pelanggan yang benar.",
                variant: "destructive"
            })
            return;
        }
        setIsChecking(true);
        // Simulate API call to check customer name
        setTimeout(() => {
            setCustomerName("JANE DOE");
            setIsChecking(false);
            toast({
                title: "Berhasil",
                description: "ID Pelanggan ditemukan.",
            })
        }, 1000);
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bolt /> Beli Token Listrik</CardTitle>
                <CardDescription>Masukkan ID Pelanggan dan pilih nominal token.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="customer-id">ID Pelanggan</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="customer-id" 
                            type="text" 
                            inputMode="numeric"
                            placeholder="Contoh: 51234567890" 
                            value={customerId}
                            onChange={handleIdChange}
                        />
                        <Button onClick={handleCheckId} disabled={isChecking || !customerId}>
                            {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
                            {!isChecking && "Cek"}
                        </Button>
                    </div>
                     {customerName && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                            Nama Pelanggan: {customerName}
                        </p>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">No. Handphone (Opsional)</Label>
                    <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="081234567890" 
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                    />
                    <p className="text-xs text-muted-foreground">Untuk pengiriman notifikasi token.</p>
                </div>

                {customerId && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <Label>Pilih Nominal Token</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {mockProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${
                                        selectedProduct?.id === product.id 
                                            ? 'border-primary ring-2 ring-primary bg-primary/10'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">{product.name.replace('Token Listrik ', '')}</p>
                                    <p className="text-xs text-primary">{formatCurrency(product.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                 <Sheet>
                    <SheetTrigger asChild>
                         <Button className="w-full" disabled={!customerId || !selectedProduct}>
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
                                    <span className="text-muted-foreground">ID Pelanggan</span>
                                    <span className="font-medium">{customerId}</span>
                                </div>
                                {customerName && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nama Pelanggan</span>
                                    <span className="font-medium">{customerName}</span>
                                </div>
                                )}
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
