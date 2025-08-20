
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { TriangleAlert, Gift, Calendar, Sparkles, Scale, PawPrint, Hourglass, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';

interface Age {
  years: number;
  months: number;
  days: number;
}

interface DetailedAge {
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

interface BirthdayCountdown {
  months: number;
  days: number;
}

const westernZodiacs = [
  { sign: 'Capricorn', start: '12-22' }, { sign: 'Aquarius', start: '01-20' },
  { sign: 'Pisces', start: '02-19' }, { sign: 'Aries', start: '03-21' },
  { sign: 'Taurus', start: '04-20' }, { sign: 'Gemini', start: '05-21' },
  { sign: 'Cancer', start: '06-21' }, { sign: 'Leo', start: '07-23' },
  { sign: 'Virgo', start: '08-23' }, { sign: 'Libra', start: '09-23' },
  { sign: 'Scorpio', start: '10-23' }, { sign: 'Sagittarius', start: '11-22' },
];

const chineseZodiacs = ['Tikus', 'Kerbau', 'Macan', 'Kelinci', 'Naga', 'Ular', 'Kuda', 'Kambing', 'Monyet', 'Ayam', 'Anjing', 'Babi'];
const chineseElements = ['Logam', 'Air', 'Kayu', 'Api', 'Tanah'];

export function AgeCalculator() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [age, setAge] = useState<Age | null>(null);
  const [detailedAge, setDetailedAge] = useState<DetailedAge | null>(null);
  const [birthdayCountdown, setBirthdayCountdown] = useState<BirthdayCountdown | null>(null);
  const [westernZodiac, setWesternZodiac] = useState<string | null>(null);
  const [chineseZodiac, setChineseZodiac] = useState<string | null>(null);
  const [chineseZodiacElement, setChineseZodiacElement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, maxLength: number, maxValue?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      if (maxValue && parseInt(value, 10) > maxValue) {
        value = String(maxValue);
      }
      setter(value);
    }
  };

  const calculateWesternZodiac = (day: number, month: number): string => {
    const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let zodiacSign = westernZodiacs[0].sign; // Default to Capricorn
    for (const zodiac of westernZodiacs) {
        if (dateStr >= zodiac.start) {
            zodiacSign = zodiac.sign;
        }
    }
    // Capricorn edge case for year end
    if (dateStr >= '12-22') {
        zodiacSign = 'Capricorn';
    }
    return zodiacSign;
  };
  
  const calculateChineseZodiac = (year: number): string => {
      const startYear = 1924; // Year of the Rat
      return chineseZodiacs[(year - startYear) % 12];
  };

  const calculateChineseZodiacElement = (year: number): string => {
    const lastDigit = year % 10;
    return chineseElements[Math.floor(lastDigit / 2)];
  };


  const handleCalculateAge = () => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (!day || !month || !year) {
      setError('Harap isi semua kolom tanggal, bulan, dan tahun.');
      resetResults();
      return;
    }
    
    if (dayNum < 1 || dayNum > 31) {
        setError('Tanggal harus antara 1 dan 31.');
        resetResults();
        return;
    }

    if (monthNum < 1 || monthNum > 12) {
        setError('Bulan harus antara 1 dan 12.');
        resetResults();
        return;
    }

    const today = new Date();
    if (yearNum < 1900 || yearNum > today.getFullYear()) {
        setError(`Tahun harus antara 1900 dan ${today.getFullYear()}.`);
        resetResults();
        return;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);

    if (isNaN(birthDate.getTime()) || birthDate.getDate() !== dayNum || birthDate.getMonth() !== monthNum - 1 || birthDate.getFullYear() !== yearNum) {
      setError('Harap masukkan tanggal, bulan, dan tahun yang valid (contoh: tanggal 30 Februari tidak ada).');
      resetResults();
      return;
    }

    if (birthDate > today) {
       setError('Tanggal lahir tidak boleh di masa depan.');
       resetResults();
       return;
    }


    setError(null);
    setIsLoading(true);

    setTimeout(() => {
        // Calculate age
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        setAge({ years, months, days });

        // Calculate detailed age
        const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        setDetailedAge({
            totalMonths: years * 12 + months,
            totalWeeks: Math.floor(totalDays / 7),
            totalDays,
            totalHours: totalDays * 24,
            totalMinutes: totalDays * 24 * 60,
            totalSeconds: totalDays * 24 * 60 * 60
        });

        // Calculate birthday countdown
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        let bMonths = 0;
        let bDays = 0;

        let tempDate = new Date(today);
        while (tempDate < nextBirthday) {
          let monthBefore = tempDate.getMonth();
          tempDate.setMonth(tempDate.getMonth() + 1);
          if(tempDate > nextBirthday) {
              tempDate.setMonth(tempDate.getMonth() - 1);
              bDays = Math.floor((nextBirthday.getTime() - tempDate.getTime())/(1000 * 3600 * 24));
              break;
          }
          bMonths++;
        }

        setBirthdayCountdown({ months: bMonths, days: bDays });

        // Calculate zodiacs
        setWesternZodiac(calculateWesternZodiac(dayNum, monthNum));
        setChineseZodiac(calculateChineseZodiac(yearNum));
        setChineseZodiacElement(calculateChineseZodiacElement(yearNum));
        
        setIsLoading(false);
    }, 700);
  };

  const resetResults = () => {
    setAge(null);
    setDetailedAge(null);
    setBirthdayCountdown(null);
    setWesternZodiac(null);
    setChineseZodiac(null);
    setChineseZodiacElement(null);
  };
  
  const handleReset = () => {
    setDay('');
    setMonth('');
    setYear('');
    setError(null);
    resetResults();
  };

  const InfoCard = ({ icon: Icon, title, value, unit }: { icon: React.ElementType, title: string, value: string | number, unit: string }) => (
    <div className="flex items-center space-x-3 rounded-md bg-muted/50 p-3">
        <Icon className="h-6 w-6 text-primary" />
        <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="font-semibold text-sm">{value} <span className="font-normal">{unit}</span></p>
        </div>
    </div>
  );

  const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );

  return (
    <div className="space-y-6">
      {!age && (
        <>
          <Card className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            <CardHeader>
              <CardTitle>Kalkulator Usia Lengkap</CardTitle>
              <CardDescription>Masukkan tanggal lahir Anda untuk mendapatkan analisis usia yang mendetail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Tanggal</Label>
                  <Input id="day" type="text" inputMode='numeric' placeholder="DD" value={day} onChange={handleInputChange(setDay, 2, 31)} maxLength={2} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">Bulan</Label>
                  <Input id="month" type="text" inputMode='numeric' placeholder="MM" value={month} onChange={handleInputChange(setMonth, 2, 12)} maxLength={2} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input id="year" type="text" inputMode='numeric' placeholder="YYYY" value={year} onChange={handleInputChange(setYear, 4)} maxLength={4} disabled={isLoading} />
                </div>
              </div>

              {error && (
                  <Alert variant="destructive">
                      <TriangleAlert className="h-4 w-4" />
                      <AlertTitle>Input Tidak Valid</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end border-t pt-6 gap-4">
              <Button onClick={handleCalculateAge} className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Menghitung...' : 'Hitung Usia'}
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fitur & Informasi yang Akan Anda Dapatkan</CardTitle>
              <CardDescription>
                Bukan hanya kalkulator usia biasa, temukan berbagai informasi menarik seputar tanggal lahir Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <FeatureListItem>
                  <strong>Usia Akurat:</strong> Lihat usia Anda dalam format tahun, bulan, dan hari.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Ringkasan Total:</strong> Konversi usia Anda ke total bulan, minggu, hari, jam, menit, bahkan detik.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Hitung Mundur Ulang Tahun:</strong> Cari tahu berapa lama lagi menuju hari spesial Anda berikutnya.
                </FeatureListItem>
                <FeatureListItem>
                  <strong>Zodiak & Shio:</strong> Temukan zodiak barat dan shio tionghoa Anda lengkap dengan elemennya.
                </FeatureListItem>
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {age && (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Hitung Ulang
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Age Summary */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>Usia Anda Saat Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-baseline justify-center text-center gap-x-4 gap-y-2 p-4 rounded-lg bg-muted">
                            <div className="flex items-baseline">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">{age.years}</span>
                                <span className="ml-2 text-base sm:text-lg md:text-xl text-muted-foreground">Tahun</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">{age.months}</span>
                                <span className="ml-2 text-base sm:text-lg md:text-xl text-muted-foreground">Bulan</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">{age.days}</span>
                                <span className="ml-2 text-base sm:text-lg md:text-xl text-muted-foreground">Hari</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Birthday & Zodiac */}
                <div className="lg:col-span-1 space-y-6">
                    {birthdayCountdown && (
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Gift className="h-5 w-5"/>Ulang Tahun Berikutnya</CardTitle></CardHeader>
                            <CardContent className="text-center">
                                <div className="text-3xl font-bold">{birthdayCountdown.months}<span className="text-lg font-medium text-muted-foreground"> bulan </span>{birthdayCountdown.days}<span className="text-lg font-medium text-muted-foreground"> hari lagi</span></div>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Scale className="h-5 w-5"/>Zodiak Barat</CardTitle></CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-semibold">{westernZodiac}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><PawPrint className="h-5 w-5"/>Shio Cina</CardTitle></CardHeader>
                        <CardContent className="text-center">
                           <p className="text-3xl font-semibold">{chineseZodiac} {chineseZodiacElement}</p>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Detailed Summary */}
                {detailedAge && (
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Hourglass className="h-5 w-5 text-primary"/>Ringkasan Lengkap</CardTitle>
                            <CardDescription>Usia Anda dikonversi ke dalam berbagai satuan waktu.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={Calendar} title="Total Bulan" value={detailedAge.totalMonths.toLocaleString('id-ID')} unit="bulan" />
                        <InfoCard icon={Calendar} title="Total Minggu" value={detailedAge.totalWeeks.toLocaleString('id-ID')} unit="minggu" />
                        <InfoCard icon={Calendar} title="Total Hari" value={detailedAge.totalDays.toLocaleString('id-ID')} unit="hari" />
                        <InfoCard icon={Hourglass} title="Total Jam" value={detailedAge.totalHours.toLocaleString('id-ID')} unit="jam" />
                        <InfoCard icon={Hourglass} title="Total Menit" value={detailedAge.totalMinutes.toLocaleString('id-ID')} unit="menit" />
                        <InfoCard icon={Hourglass} title="Total Detik" value={detailedAge.totalSeconds.toLocaleString('id-ID')} unit="detik" />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
