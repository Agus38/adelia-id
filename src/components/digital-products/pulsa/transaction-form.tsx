
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type Operator = 'Telkomsel' | 'Indosat' | 'XL' | 'AXIS' | 'Tri' | 'Smartfren' | null;

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

const mockProducts = {
    Telkomsel: [
        { id: 'p5', name: 'Pulsa 5.000', price: 5500 },
        { id: 'p10', name: 'Pulsa 10.000', price: 10500 },
        { id: 'p25', name: 'Pulsa 25.000', price: 25000 },
        { id: 'p50', name: 'Pulsa 50.000', price: 50000 },
        { id: 'p100', name: 'Pulsa 100.000', price: 99500 },
    ],
    Indosat: [
        { id: 'i5', name: 'Pulsa 5.000', price: 5800 },
        { id: 'i10', name: 'Pulsa 10.000', price: 10800 },
        { id: 'i25', name: 'Pulsa 25.000', price: 25200 },
        { id: 'i50', name: 'Pulsa 50.000', price: 50000 },
        { id: 'i100', name: 'Pulsa 100.000', price: 99800 },
    ],
     XL: [
        { id: 'xl5', name: 'Pulsa 5.000', price: 5900 },
        { id: 'xl10', name: 'Pulsa 10.000', price: 10900 },
        { id: 'xl25', name: 'Pulsa 25.000', price: 25100 },
        { id: 'xl50', name: 'Pulsa 50.000', price: 50000 },
        { id: 'xl100', name: 'Pulsa 100.000', price: 99900 },
    ],
     AXIS: [
        { id: 'ax5', name: 'Pulsa 5.000', price: 5700 },
        { id: 'ax10', name: 'Pulsa 10.000', price: 10700 },
    ],
    // Add other operators if needed
};

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export function PulsaTransactionForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [operator, setOperator] = useState<Operator>(null);
    const [products, setProducts] = useState<typeof mockProducts.Telkomsel>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        const detectOperator = () => {
            if (phoneNumber.length < 4) {
                setOperator(null);
                setProducts([]);
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
            
            // Simulate API call delay
            setTimeout(() => {
                setOperator(foundOperator);
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
                        <Label>Pilih Nominal</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product.id)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${
                                        selectedProduct === product.id 
                                            ? 'border-primary ring-2 ring-primary bg-primary/10'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <p className="font-semibold text-sm">{product.name.replace('Pulsa ', '')}</p>
                                    <p className="text-xs text-primary">{formatCurrency(product.price)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {operator && products.length === 0 && !isFetching && (
                    <div className="text-center text-muted-foreground p-4 bg-muted rounded-lg">
                        Produk untuk operator {operator} belum tersedia.
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!phoneNumber || !selectedProduct || isFetching}>
                    Beli Sekarang
                </Button>
            </CardFooter>
        </Card>
    )
}
