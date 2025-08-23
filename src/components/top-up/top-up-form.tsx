
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote, QrCode, Landmark, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const predefinedAmounts = [50000, 100000, 150000, 200000, 300000, 500000];

const paymentMethods = [
  { id: 'va', name: 'Virtual Account', icon: Banknote },
  { id: 'qris', name: 'QRIS', icon: QrCode },
  { id: 'transfer', name: 'Transfer Bank', icon: Landmark },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function TopUpForm() {
  const [amount, setAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  
  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setAmount(Number(value));
  };
  
  const handleProceedToPayment = () => {
    if (amount <= 0) {
        toast({
            title: "Jumlah Tidak Valid",
            description: "Harap pilih atau masukkan jumlah top up yang valid.",
            variant: "destructive"
        })
        return;
    }

    // NOTE: Mock implementation for payment flow
    toast({
        title: "Memproses Pembayaran...",
        description: `Top up sebesar ${formatCurrency(amount)} menggunakan ${paymentMethods.find(p => p.id === paymentMethod)?.name}.`
    });
    console.log({ amount, paymentMethod });
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Isi Ulang Saldo</CardTitle>
        <CardDescription>
          Pilih nominal atau masukkan jumlah yang Anda inginkan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Pilih Nominal Cepat</Label>
          <div className="grid grid-cols-3 gap-3">
            {predefinedAmounts.map((predefinedAmount) => (
              <Button
                key={predefinedAmount}
                variant={amount === predefinedAmount && !customAmount ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(predefinedAmount)}
              >
                {formatCurrency(predefinedAmount).replace('Rp', 'Rp ')}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customAmount">Atau Masukkan Jumlah Lain</Label>
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
             <Input
                id="customAmount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={customAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                onChange={handleCustomAmountChange}
                className="pl-8 font-semibold"
            />
           </div>
        </div>

        <div className="space-y-3">
            <Label>Pilih Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
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
        <Button className="w-full" onClick={handleProceedToPayment} disabled={amount <= 0}>
           <Wallet className="mr-2 h-4 w-4" />
           Lanjutkan Pembayaran ({formatCurrency(amount)})
        </Button>
      </CardFooter>
    </Card>
  );
}
