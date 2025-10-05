import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PrayerTime {
  saat: string;
  vakit: string;
}

// Daftar kota di Turki (sebagai pengganti API kota)
const turkishCities = [
    { id: 'istanbul', nama: 'Istanbul' },
    { id: 'ankara', nama: 'Ankara' },
    { id: 'izmir', nama: 'Izmir' },
    { id: 'bursa', nama: 'Bursa' },
    { id: 'adana', nama: 'Adana' },
    { id: 'gaziantep', nama: 'Gaziantep' },
    { id: 'konya', nama: 'Konya' },
    { id: 'antalya', nama: 'Antalya' },
    { id: 'diyarbakir', nama: 'Diyarbakir' },
    { id: 'mersin', nama: 'Mersin' },
    { id: 'kayseri', nama: 'Kayseri' },
].sort((a, b) => a.nama.localeCompare(b.nama));


async function getPrayerTimes(city: string): Promise<{ result?: PrayerTime[], error?: string }> {
  const apiKey = process.env.PRAYER_API_TOKEN;
  if (!apiKey || apiKey === 'your_token') {
    return { error: 'API Key untuk jadwal sholat belum diatur di server.' };
  }

  try {
    const response = await fetch(`https://api.collectapi.com/pray/all?city=${city}`, {
      headers: {
        "content-type": "application/json",
        "authorization": `apikey ${apiKey}`
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return { result: data.result };
  } catch (error: any) {
    console.error('Error fetching prayer times:', error);
    return { error: `Gagal mengambil data untuk ${city}. Coba kota lain.` };
  }
}

export default async function JadwalSholatPage({ searchParams }: { searchParams: { city?: string } }) {
  const selectedCity = searchParams.city || 'istanbul';
  const { result: prayerTimes, error } = await getPrayerTimes(selectedCity);
  const currentDate = format(new Date(), 'eeee, dd MMMM yyyy', { locale: id });

  const prayerScheduleMap: { [key: string]: string } = {
    'Imsak': 'İmsak',
    'Subuh': 'Güneş', // Literally "Sun", maps to sunrise
    'Terbit': 'Öğle', // Literally "Noon", maps to Dhuhr
    'Dzuhur': 'İkindi', // Literally "Afternoon", maps to Asr
    'Ashar': 'Akşam', // Literally "Evening", maps to Maghrib
    'Maghrib': 'Yatsı', // Literally "Night", maps to Isha
    'Isya': 'Yatsı' // Duplicate for safety, Isha
  };
  
  const schedule = prayerTimes
    ? Object.entries(prayerScheduleMap).map(([indonesianName, turkishName]) => {
        const timeData = prayerTimes.find(pt => pt.saat === turkishName);
        return { name: indonesianName, time: timeData?.vakit || '-' };
      })
    : [];

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
                   <CardDescription>{currentDate}</CardDescription>
                </div>
            </div>
            <form>
                <div className="space-y-2 pt-4">
                <Label htmlFor="city-select">Pilih Lokasi Kota (Turki)</Label>
                <Select name="city" defaultValue={selectedCity}>
                    <SelectTrigger id="city-select">
                        <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                    {turkishCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                            {city.nama}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                 <Button type="submit" className="w-full mt-2">Tampilkan Jadwal</Button>
                </div>
            </form>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
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
                        {schedule.map(item => (
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
