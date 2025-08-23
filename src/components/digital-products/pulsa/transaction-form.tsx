
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";


export function PulsaTransactionForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    const products = [
        { id: 'p5', name: 'Pulsa 5.000', price: 'Rp 5.500' },
        { id: 'p10', name: 'Pulsa 10.000', price: 'Rp 10.500' },
        { id: 'p25', name: 'Pulsa 25.000', price: 'Rp 25.000' },
        { id: 'p50', name: 'Pulsa 50.000', price: 'Rp 50.000' },
        { id: 'p100', name: 'Pulsa 100.000', price: 'Rp 99.500' },
    ];

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Transaksi Pulsa</CardTitle>
                <CardDescription>Masukkan nomor tujuan dan pilih nominal pulsa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Handphone</Label>
                    <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="081234567890" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product">Pilih Produk</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger id="product">
                            <SelectValue placeholder="Pilih nominal pulsa" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                    <div className="flex justify-between w-full">
                                        <span>{product.name}</span>
                                        <span className="text-muted-foreground">{product.price}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={!phoneNumber || !selectedProduct}>
                    Beli Sekarang
                </Button>
            </CardFooter>
        </Card>
    )
}
