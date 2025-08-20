
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert } from 'lucide-react';

interface Age {
  years: number;
  months: number;
  days: number;
}

export function AgeCalculator() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState<Age | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculateAge = () => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);

    if (isNaN(birthDate.getTime()) || birthDate.getDate() !== dayNum || birthDate.getMonth() !== monthNum - 1 || birthDate.getFullYear() !== yearNum || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Harap masukkan tanggal, bulan, dan tahun yang valid.');
      setAge(null);
      return;
    }

    setError(null);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }
    
    if (days < 0) {
        const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonthLastDay;
        months--;
        if (months < 0) {
            months += 12;
            years--;
        }
    }

    setAge({ years, months, days });
  };
  
  const handleReset = () => {
    setDay('');
    setMonth('');
    setYear('');
    setAge(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kalkulator Usia</CardTitle>
        <CardDescription>Masukkan tanggal lahir Anda di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="day">Tanggal</Label>
            <Input id="day" type="number" placeholder="DD" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Bulan</Label>
            <Input id="month" type="number" placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Tahun</Label>
            <Input id="year" type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>

        {error && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Input Tidak Valid</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {age && (
            <div>
                <Label>Usia Anda Saat Ini Adalah:</Label>
                <div className="flex items-baseline justify-center text-center p-6 mt-2 rounded-lg bg-muted">
                    <div className="flex items-baseline">
                        <span className="text-5xl font-bold tracking-tighter">{age.years}</span>
                        <span className="ml-2 text-xl text-muted-foreground">Tahun</span>
                    </div>
                    <div className="flex items-baseline ml-4">
                        <span className="text-5xl font-bold tracking-tighter">{age.months}</span>
                         <span className="ml-2 text-xl text-muted-foreground">Bulan</span>
                    </div>
                    <div className="flex items-baseline ml-4">
                        <span className="text-5xl font-bold tracking-tighter">{age.days}</span>
                        <span className="ml-2 text-xl text-muted-foreground">Hari</span>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button onClick={handleCalculateAge}>Hitung Usia</Button>
      </CardFooter>
    </Card>
  );
}
