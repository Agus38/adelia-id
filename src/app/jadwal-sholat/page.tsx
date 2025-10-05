
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CalendarClock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface City {
  id: string;
  nama: string;
}

interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

interface ApiResponse {
  status: boolean;
  data: {
    adzan: PrayerTimes;
  };
}

export default function JadwalSholatPage() {
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [prayerTimes, setPrayerTimes] = React.useState<PrayerTimes | null>(null);
  const [isLoadingCities, setIsLoadingCities] = React.useState(true);
  const [isLoadingTimes, setIsLoadingTimes] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const today = new Date();
  const formattedDate = format(today, 'eeee, dd MMMM yyyy', { locale: id });
  const apiDate = format(today, 'yyyy-MM-dd');

  React.useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://jadwalsholat.org/api/v2/kota/semua');
        if (!response.ok) {
          throw new Error('Gagal mengambil daftar kota.');
        }
        const data = await response.json();
        if (data.status && data.data) {
          setCities(data.data);
          // Set default city to a common one, e.g., Jakarta
          const defaultCity = data.data.find((c: City) => c.nama.toLowerCase() === 'jakarta');
          if (defaultCity) {
            setSelectedCity(defaultCity.id);
          }
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
    if (selectedCity) {
      const fetchPrayerTimes = async () => {
        setIsLoadingTimes(true);
        setPrayerTimes(null);
        setError(null);
        try {
          const response = await fetch(`https://jadwalsholat.org/api/v2/adzan/kota/${selectedCity}/tanggal/${apiDate}`);
          if (!response.ok) {
            throw new Error('Gagal mengambil jadwal sholat.');
          }
          const data: ApiResponse = await response.json();
          if (data.status && data.data) {
            setPrayerTimes(data.data.adzan);
          } else {
            throw new Error('Format data jadwal sholat tidak valid.');
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoadingTimes(false);
        }
      };
      fetchPrayerTimes();
    }
  }, [selectedCity, apiDate]);
  
  const prayerSchedule = prayerTimes ? [
    { name: 'Imsak', time: prayerTimes.imsak },
    { name: 'Subuh', time: prayerTimes.subuh },
    { name: 'Terbit', time: prayerTimes.terbit },
    { name: 'Dzuhur', time: prayerTimes.dzuhur },
    { name: 'Ashar', time: prayerTimes.ashar },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isya', time: prayerTimes.isya },
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
                   <CardDescription>{formattedDate}</CardDescription>
                </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="city-select">Pilih Lokasi Kota</Label>
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
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
            ) : prayerTimes ? (
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
