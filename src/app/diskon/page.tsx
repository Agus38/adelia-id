
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, RefreshCw } from 'lucide-react';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
};

export default function DiskonPage() {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);

  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 12) {
      setter(value);
    }
  };
  
  const formatDisplayValue = (value: string) => {
    if (!value) return '';
    return Number(value).toLocaleString('id-ID');
  };

  const calculateDiscount = () => {
    const original = parseFloat(originalPrice);
    const discounted = parseFloat(discountedPrice);

    if (!isNaN(original) && !isNaN(discounted) && original > 0 && original > discounted) {
      const amount = original - discounted;
      const percentage = (amount / original) * 100;
      setDiscountAmount(amount);
      setDiscountPercentage(percentage);
    } else {
      setDiscountAmount(null);
      setDiscountPercentage(null);
    }
  };
  
  const handleReset = () => {
      setOriginalPrice('');
      setDiscountedPrice('');
      setDiscountAmount(null);
      setDiscountPercentage(null);
  }

  // Calculate on price change
  useState(() => {
    calculateDiscount();
  });


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="h-8 w-8" />
            <CardTitle className="text-3xl">Kalkulator Diskon</CardTitle>
          </div>
          <CardDescription>Hitung potongan harga dengan mudah untuk mengetahui besaran diskon dalam nominal dan persentase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="original-price">Harga Asli (Sebelum Diskon)</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input 
                    id="original-price" 
                    type="text"
                    inputMode='numeric'
                    placeholder="0" 
                    value={formatDisplayValue(originalPrice)} 
                    onChange={handlePriceChange(setOriginalPrice)}
                    onBlur={calculateDiscount}
                    className="pl-8 font-semibold"
                    maxLength={12}
                />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discounted-price">Harga Setelah Diskon</Label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Input 
                    id="discounted-price" 
                    type="text"
                    inputMode='numeric'
                    placeholder="0" 
                    value={formatDisplayValue(discountedPrice)} 
                    onChange={handlePriceChange(setDiscountedPrice)}
                    onBlur={calculateDiscount}
                    className="pl-8 font-semibold"
                    maxLength={12}
                />
            </div>
          </div>
          
           {(discountAmount !== null || discountPercentage !== null) && (
              <div className="space-y-4 pt-4 border-t animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-center">Hasil Perhitungan</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Potongan Harga</p>
                          <p className="text-2xl font-bold text-primary">{formatCurrency(discountAmount ?? 0)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Persentase Diskon</p>
                          <p className="text-2xl font-bold text-primary">{discountPercentage?.toFixed(1) ?? '0'}%</p>
                      </div>
                  </div>
              </div>
          )}
          
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4"/> Reset
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
