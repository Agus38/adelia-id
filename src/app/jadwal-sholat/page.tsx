
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CalendarClock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Label } from '@/components/ui/label';

interface City {
  id: string;
  nama: string;
}

interface PrayerTimes {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export default function JadwalSholatPage() {
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = React.useState<string>(''); // e.g., 'bandung'
  const [dailyPrayerTimes, setDailyPrayerTimes] = React.useState<PrayerTimes | null>(null);
  const [isLoadingCities, setIsLoadingCities] = React.useState(true);
  const [isLoadingTimes, setIsLoadingTimes] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentDate, setCurrentDate] = React.useState<{ formatted: string; apiDate: { year: string, month: string, day: string } } | null>(null);

  React.useEffect(() => {
    // This effect runs only on the client, avoiding hydration mismatch.
    const today = new Date();
    setCurrentDate({
      formatted: format(today, 'eeee, dd MMMM yyyy', { locale: id }),
      apiDate: {
        year: format(today, 'yyyy'),
        month: format(today, 'MM'),
        day: format(today, 'yyyy-MM-dd')
      }
    });

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/kota.json');
        if (!response.ok) {
          throw new Error('Gagal mengambil daftar kota.');
        }
        const data: string[] = await response.json();
        
        const cityMap = new Map<string, City>();
        data.forEach(cityString => {
            const parts = cityString.split(':');
            if (parts.length === 2) {
                const [id, nama] = parts;
                if (!cityMap.has(id)) {
                    cityMap.set(id, { id: nama.toLowerCase(), nama: nama.charAt(0).toUpperCase() + nama.slice(1) });
                }
            }
        });

        const parsedCities = Array.from(cityMap.values()).sort((a,b) => a.nama.localeCompare(b.nama));
        setCities(parsedCities);
        
        // Set default city to a common one, e.g., Jakarta
        const defaultCity = parsedCities.find((c: City) => c.nama.toUpperCase() === 'JAKARTA');
        if (defaultCity) {
          setSelectedCityId(defaultCity.id);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  React.useEffect(() => {
    if (selectedCityId && currentDate) {
      const fetchPrayerTimes = async () => {
        setIsLoadingTimes(true);
        setDailyPrayerTimes(null);
        setError(null);
        try {
          const { year, month, day } = currentDate.apiDate;
          const response = await fetch(`https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/${selectedCityId}/${year}/${month}.json`);
          if (!response.ok) {
            throw new Error(`Gagal mengambil jadwal sholat untuk ${selectedCityId}.`);
          }
          const monthlyData: PrayerTimes[] = await response.json();
          const todaySchedule = monthlyData.find(d => d.tanggal === day);

          if (todaySchedule) {
            setDailyPrayerTimes(todaySchedule);
          } else {
            throw new Error('Jadwal untuk hari ini tidak ditemukan.');
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoadingTimes(false);
        }
      };
      fetchPrayerTimes();
    }
  }, [selectedCityId, currentDate]);
  
  const prayerSchedule = dailyPrayerTimes ? [
    { name: 'Imsak', time: dailyPrayerTimes.imsak },
    { name: 'Subuh', time: dailyPrayerTimes.subuh },
    { name: 'Terbit', time: dailyPrayerTimes.terbit },
    { name: 'Dzuhur', time: dailyPrayerTimes.dzuhur },
    { name: 'Ashar', time: dailyPrayerTimes.ashar },
    { name: 'Maghrib', time: dailyPrayerTimes.maghrib },
    { name: 'Isya', time: dailyPrayerTimes.isya },
  ] : [];

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                   <CalendarClock className="h-7 w-7 text-primary" />
                </div>
                <div>
                   <CardTitle>Jadwal Sholat</CardTitle>
                   <CardDescription>{currentDate?.formatted || 'Memuat tanggal...'}</CardDescription>
                </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="city-select">Pilih Lokasi Kota</Label>
              <Select
                value={selectedCityId}
                onValueChange={setSelectedCityId}
                disabled={isLoadingCities}
              >
                <SelectTrigger id="city-select">
                  <SelectValue placeholder={isLoadingCities ? 'Memuat daftar kota...' : 'Pilih kota'} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTimes ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : dailyPrayerTimes ? (
               <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu Sholat</TableHead>
                        <TableHead className="text-right">Jam</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {prayerSchedule.map(item => (
                             <TableRow key={item.name}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right font-mono text-base">{item.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
               </div>
            ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mb-2"/>
                    <p>Silakan pilih kota untuk menampilkan jadwal sholat.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
