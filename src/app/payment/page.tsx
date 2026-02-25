
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote, QrCode, Landmark, Wallet, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

const paymentMethods = [
  { id: 'va', name: 'Virtual Account', icon: Banknote, description: "Bayar melalui akun virtual bank." },
  { id: 'qris', name: 'QRIS', icon: QrCode, description: "Pindai kode QR dengan aplikasi e-wallet Anda." },
  { id: 'transfer', name: 'Transfer Bank', icon: Landmark, description: "Transfer manual ke rekening bank kami." },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

// Mock data, in a real app this would come from props or state management
const orderDetails = {
    productName: "Telkomsel Pulsa 10.000",
    phoneNumber: "081234567890",
    totalAmount: 10500,
    userBalance: 123456,
}

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState('saldo');
  
  const handleProcessPayment = () => {
    toast({
        title: "Pembayaran Diproses...",
        description: `Melanjutkan pembayaran sebesar ${formatCurrency(orderDetails.totalAmount)}.`
    });
    // Placeholder for actual payment logic
  }

  return (
    <div className="flex flex-col items-center flex-1 p-4 pt-6 md:p-8">
      <div className="w-full max-w-lg">
         <Link href="/digital-products/pulsa" className="flex items-center text-sm text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1"/>
          Kembali ke Transaksi
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Pilih Metode Pembayaran</CardTitle>
            <CardDescription>
              Pilih cara Anda ingin membayar pesanan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* Order Summary */}
            <div className="space-y-3">
                <Label className="text-base">Ringkasan Pesanan</Label>
                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Produk</span>
                            <span className="font-medium">{orderDetails.productName}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Nomor Tujuan</span>
                            <span className="font-medium">{orderDetails.phoneNumber}</span>
                        </div>
                        <Separator className="my-2"/>
                         <div className="flex justify-between text-base font-bold">
                            <span>Total Tagihan</span>
                            <span className="text-primary">{formatCurrency(orderDetails.totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
                <Label className="text-base">Metode Pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    {/* Saldo Aplikasi */}
                    <Label 
                        htmlFor="saldo"
                        className="flex flex-col space-y-1 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="saldo" id="saldo" />
                            <Wallet className="h-5 w-5 text-muted-foreground" />
                            <div className='flex-1 flex justify-between items-center'>
                               <span className="font-medium text-sm">Saldo Aplikasi</span>
                               <span className="font-bold text-sm text-primary">{formatCurrency(orderDetails.userBalance)}</span>
                            </div>
                        </div>
                        {orderDetails.userBalance < orderDetails.totalAmount && (
                            <p className="pl-8 text-xs text-destructive">Saldo tidak mencukupi.</p>
                        )}
                    </Label>

                    {/* Other Methods */}
                    {paymentMethods.map(method => (
                        <Label 
                            key={method.id} 
                            htmlFor={method.id}
                            className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors cursor-pointer"
                        >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <method.icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium text-sm">{method.name}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
                className="w-full" 
                onClick={handleProcessPayment} 
                disabled={paymentMethod === 'saldo' && orderDetails.userBalance < orderDetails.totalAmount}
            >
               Bayar Sekarang
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
