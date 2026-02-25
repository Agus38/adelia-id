
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface City {
  id: string;
  lokasi: string;
}

interface Jadwal {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

interface PrayerData {
  lokasi: string;
  daerah: string;
  jadwal: Jadwal & { tanggal: string };
}

const scheduleOrder: (keyof Jadwal)[] = ['imsak', 'subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'];
const scheduleLabels: Record<keyof Jadwal, string> = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  terbit: 'Terbit',
  dhuha: 'Dhuha',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
};

const DEFAULT_CITY_ID = '1301'; // Jakarta

export default function JadwalSholatPage() {
  const [cities, setCities] = React.useState<City[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<City | null>(null);
  const [prayerData, setPrayerData] = React.useState<PrayerData | null>(null);
  const [isLoadingCities, setIsLoadingCities] = React.useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [comboboxOpen, setComboboxOpen] = React.useState(false);

  // Fetch all cities once
  React.useEffect(() => {
    const fetchCityData = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
        if (!response.ok) throw new Error('Gagal mengambil daftar kota');
        const cityListData = await response.json();
        if (!cityListData.status || !Array.isArray(cityListData.data)) throw new Error('Format data kota tidak valid');
        
        const sortedCities: City[] = cityListData.data.sort((a: City, b: City) => a.lokasi.localeCompare(b.lokasi));
        setCities(sortedCities);
        
        // Set Jakarta as the default city after fetching
        const defaultCity = sortedCities.find(c => c.id === DEFAULT_CITY_ID) || sortedCities[0] || null;
        setSelectedCity(defaultCity);

      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat kota.');
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCityData();
  }, []);

  // Fetch schedule whenever selectedCity changes
  React.useEffect(() => {
    if (!selectedCity) return;

    const fetchSchedule = async () => {
      setIsLoadingSchedule(true);
      setPrayerData(null);
      setError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${selectedCity.id}/${year}/${month}/${day}`);
        if (!response.ok) throw new Error(`Jadwal untuk ${selectedCity.lokasi} tidak tersedia.`);
        const data = await response.json();

        if (!data.status || !data.data?.jadwal) throw new Error('Format data jadwal tidak valid');
        setPrayerData(data.data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingSchedule(false);
      }
    };
    
    fetchSchedule();
  }, [selectedCity]);
  
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
                   <CardDescription>
                      {prayerData?.jadwal.tanggal || 'Pilih lokasi untuk melihat jadwal'}
                   </CardDescription>
                </div>
            </div>
            <div className="space-y-2 pt-4">
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className="w-full justify-between"
                            disabled={isLoadingCities}
                        >
                            {isLoadingCities && !selectedCity ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Memuat kota...
                                </>
                            ) : selectedCity ? (
                                selectedCity.lokasi
                            ) : (
                                "Pilih kota..."
                            )}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" style={{width: 'var(--radix-popover-trigger-width)'}}>
                        <Command>
                            <CommandInput placeholder="Cari kota..." />
                            <CommandList>
                                <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    {cities.map((city) => (
                                        <CommandItem
                                            key={city.id}
                                            value={city.lokasi}
                                            onSelect={() => {
                                                setSelectedCity(city);
                                                setComboboxOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn("mr-2 h-4 w-4", selectedCity?.id === city.id ? "opacity-100" : "opacity-0")}
                                            />
                                            {city.lokasi}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSchedule ? (
                 <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 mb-2 animate-spin"/>
                    <p>Memuat jadwal untuk {selectedCity?.lokasi || 'lokasi Anda'}...</p>
                </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
            ) : prayerData ? (
               <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu Sholat</TableHead>
                        <TableHead className="text-right">Jam</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scheduleOrder.map(key => (
                             <TableRow key={key}>
                                <TableCell className="font-medium">{scheduleLabels[key]}</TableCell>
                                <TableCell className="text-right font-mono text-base">{prayerData.jadwal[key]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
               </div>
            ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                    <p>Pilih kota untuk menampilkan jadwal.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
