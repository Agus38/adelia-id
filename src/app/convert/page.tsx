'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Repeat, Loader2, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Currency {
  code: string;
  name: string;
}

const API_KEY = "c69a6e227d4345b58864c9bd78f7e356";

export default function ConvertPage() {
  const [currencies, setCurrencies] = React.useState<Currency[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConverting, setIsConverting] = React.useState(false);

  const [amount, setAmount] = React.useState('1');
  const [fromCurrency, setFromCurrency] = React.useState('USD');
  const [toCurrency, setToCurrency] = React.useState('IDR');
  const [result, setResult] = React.useState<number | null>(null);
  const [rateInfo, setRateInfo] = React.useState('');

  React.useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`https://api.currencyfreaks.com/v2.0/supported-currencies`);
        const data = await response.json();

        if (data.supportedCurrenciesMap) {
          const currencyList = Object.entries(data.supportedCurrenciesMap).map(([code, details]) => ({
            code: code,
            name: `${(details as any).currencyName} (${code})`
          })).filter(c => (data.supportedCurrenciesMap[c.code] as any).status === 'available');

          currencyList.sort((a, b) => a.name.localeCompare(b.name));
          setCurrencies(currencyList);
        } else {
           throw new Error('Gagal mengambil daftar mata uang.');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Gagal mengambil daftar mata uang dari server.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      toast({ title: 'Input Tidak Lengkap', description: 'Harap isi semua kolom.', variant: 'destructive' });
      return;
    }
    
    setIsConverting(true);
    setResult(null);
    setRateInfo('');

    try {
        const response = await fetch(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}&symbols=${toCurrency}&base=${fromCurrency}`);
        const data = await response.json();
        
        if (data.rates && data.rates[toCurrency]) {
            const rate = parseFloat(data.rates[toCurrency]);
            const convertedAmount = parseFloat(amount) * rate;
            setResult(convertedAmount);
            setRateInfo(`1 ${fromCurrency} = ${rate.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toCurrency}`);
        } else {
            throw new Error(data.message || 'Gagal mengambil kurs mata uang.');
        }

    } catch (error: any) {
        toast({
            title: 'Gagal Mengonversi',
            description: error.message || 'Terjadi kesalahan saat menghubungi server konversi.',
            variant: 'destructive',
        });
    } finally {
        setIsConverting(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };
  
  const formatCurrencyResult = (value: number) => {
      return value.toLocaleString('id-ID', {
          style: 'currency',
          currency: toCurrency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
      });
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Repeat className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Konverter Mata Uang</h2>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Konversi Cepat</CardTitle>
          <CardDescription>Pilih mata uang dan masukkan jumlah untuk dikonversi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                disabled={isConverting}
              />
            </div>
          </div>
          <div className="grid grid-cols-11 gap-2 items-center">
            <div className="col-span-5 space-y-2">
              <Label>Dari</Label>
               <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={isLoading || isConverting}>
                <SelectTrigger><SelectValue placeholder="Pilih Mata Uang" /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 flex justify-center pt-6">
                <Button variant="ghost" size="icon" onClick={handleSwapCurrencies} disabled={isConverting}>
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground"/>
                </Button>
            </div>
            <div className="col-span-5 space-y-2">
              <Label>Ke</Label>
              <Select value={toCurrency} onValueChange={setToCurrency} disabled={isLoading || isConverting}>
                <SelectTrigger><SelectValue placeholder="Pilih Mata Uang" /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
           {(isLoading || isConverting) && (
              <div className="flex items-center justify-center pt-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">{isLoading ? 'Memuat daftar mata uang...' : 'Mengonversi...'}</p>
              </div>
          )}
          {result !== null && (
               <div className="pt-4 text-center animate-in fade-in duration-300">
                    <p className="text-sm text-muted-foreground">{parseFloat(amount).toLocaleString('id-ID')} {fromCurrency} =</p>
                    <p className="text-4xl font-bold text-primary">{formatCurrencyResult(result)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rateInfo}</p>
                </div>
          )}
        </CardContent>
         <CardFooter>
            <Button className="w-full" onClick={handleConvert} disabled={isLoading || isConverting}>
                Konversi Sekarang
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}