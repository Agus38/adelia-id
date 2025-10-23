
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, MapPin, Wind, Droplets, Sunrise, Sunset, Loader2, AlertTriangle, CloudSun, Thermometer, Cloud, Eye } from 'lucide-react';
import Image from 'next/image';
import { format, fromUnixTime } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface WeatherData {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: { temp: number; feels_like: number; temp_min: number; temp_max: number; pressure: number; humidity: number; };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { type: number; id: number; country: string; sunrise: number; sunset: number; };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

type ForecastItem = {
    dt: number;
    main: { temp: number; feels_like: number; temp_min: number; temp_max: number; pressure: number; humidity: number; };
    weather: { id: number; main: string; description: string; icon: string; }[];
    wind: { speed: number; deg: number };
    dt_txt: string;
    clouds: { all: number };
    visibility: number;
};

interface ForecastData {
    list: ForecastItem[];
    city: { name: string; country: string; sunrise: number; sunset: number; };
}

const API_KEY = '2c22f1e55ce0ba542652c2b4164b47eb';
const DEFAULT_CITY = 'Jakarta';

export default function WeatherPage() {
    const [city, setCity] = React.useState('');
    const [weather, setWeather] = React.useState<WeatherData | null>(null);
    const [forecast, setForecast] = React.useState<ForecastData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [lastSearchedQuery, setLastSearchedQuery] = React.useState<string | { lat: number, lon: number }>(DEFAULT_CITY);

    const [selectedForecast, setSelectedForecast] = React.useState<ForecastItem | null>(null);
    const [isDetailOpen, setDetailOpen] = React.useState(false);

    const handleForecastClick = (item: ForecastItem) => {
        setSelectedForecast(item);
        setDetailOpen(true);
    }

    const fetchWeatherData = React.useCallback(async (query: string | { lat: number, lon: number }) => {
        if (!query) return;
        setIsLoading(true);
        setError(null);
        setWeather(null);
        setForecast(null);

        const weatherParams = typeof query === 'string'
            ? `q=${query}`
            : `lat=${query.lat}&lon=${query.lon}`;

        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?${weatherParams}&appid=${API_KEY}&units=metric&lang=id`);
            if (!weatherResponse.ok) {
                if (weatherResponse.status === 404) throw new Error(`Kota "${typeof query === 'string' ? query : 'lokasi Anda'}" tidak ditemukan.`);
                throw new Error('Gagal mengambil data cuaca saat ini.');
            }
            const weatherData: WeatherData = await weatherResponse.json();
            setWeather(weatherData);

            const forecastParams = `lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`;
            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${forecastParams}&appid=${API_KEY}&units=metric&lang=id`);
            if (!forecastResponse.ok) throw new Error('Gagal mengambil data prakiraan cuaca.');
            const forecastData: ForecastData = await forecastResponse.json();
            setForecast(forecastData);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLastSearchedQuery({ lat: latitude, lon: longitude });
            },
            (err) => {
                console.warn(`Geolocation error (${err.code}): ${err.message}`);
                setLastSearchedQuery(DEFAULT_CITY);
            },
            { timeout: 10000 }
        );
    }, []);

    React.useEffect(() => {
        fetchWeatherData(lastSearchedQuery);
    }, [fetchWeatherData, lastSearchedQuery]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            setLastSearchedQuery(city);
        }
    };
    
    const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Icon className="h-5 w-5 text-primary"/>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
    
    const DetailInfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4"/>
                <span>{label}</span>
            </div>
            <span className="font-semibold text-sm">{value}</span>
        </div>
    );

    const groupedForecast = React.useMemo(() => {
        if (!forecast) return {};
        return forecast.list.reduce((acc, item) => {
            const date = format(fromUnixTime(item.dt), 'EEEE, d MMM yyyy', { locale: id });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {} as Record<string, ForecastItem[]>);
    }, [forecast]);

  return (
    <>
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-primary/10 p-3">
                    <CloudSun className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Prakiraan Cuaca</h2>
                    <p className="text-sm text-muted-foreground">Lihat informasi cuaca terkini di seluruh dunia.</p>
                </div>
            </div>
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
                <Input 
                    type="text"
                    placeholder="Cari kota..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full sm:w-64"
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
                </Button>
            </form>
        </div>

        {error && !isLoading && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Terjadi Kesalahan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoading && (
             <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground animate-pulse">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary"/>
                <p>Memuat data cuaca...</p>
             </div>
        )}
        
        {weather && forecast && !isLoading && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Current Weather Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MapPin className="h-6 w-6"/> {weather.name}, {weather.sys.country}
                        </CardTitle>
                        <CardDescription>{format(new Date(), "eeee, d MMMM yyyy, HH:mm", { locale: id })}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <Image
                                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                                alt={weather.weather[0].description}
                                width={128}
                                height={128}
                                className="w-24 h-24 md:w-32 md:h-32"
                            />
                            <div>
                                <p className="text-5xl md:text-7xl font-bold">{Math.round(weather.main.temp)}°C</p>
                                <p className="capitalize text-muted-foreground">{weather.weather[0].description}</p>
                                <p className="text-sm text-muted-foreground">Terasa seperti {Math.round(weather.main.feels_like)}°C</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoCard icon={Droplets} label="Kelembapan" value={`${weather.main.humidity}%`} />
                            <InfoCard icon={Wind} label="Angin" value={`${weather.wind.speed.toFixed(1)} m/s`} />
                            <InfoCard icon={Sunrise} label="Matahari Terbit" value={format(fromUnixTime(weather.sys.sunrise), 'HH:mm')} />
                            <InfoCard icon={Sunset} label="Matahari Terbenam" value={format(fromUnixTime(weather.sys.sunset), 'HH:mm')} />
                        </div>
                    </CardContent>
                </Card>

                {/* Forecast Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Prakiraan Cuaca 5 Hari</CardTitle>
                        <CardDescription>Prakiraan cuaca untuk {weather.name} setiap 3 jam. Klik untuk detail.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(groupedForecast).map(([date, items]) => (
                            <div key={date}>
                                <h3 className="font-semibold mb-3">{date}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                                    {items.map((item, index) => (
                                        <button 
                                          key={index} 
                                          onClick={() => handleForecastClick(item)} 
                                          className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/50 transition-colors hover:bg-primary/10 hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <p className="font-semibold text-sm">{format(fromUnixTime(item.dt), 'HH:mm')}</p>
                                            <Image
                                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                                alt={item.weather[0].description}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10"
                                            />
                                            <p className="font-bold">{Math.round(item.main.temp)}°C</p>
                                            <p className="text-xs capitalize text-muted-foreground truncate w-full">{item.weather[0].description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )}
        
        <Dialog open={isDetailOpen} onOpenChange={setDetailOpen}>
            {selectedForecast && (
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Cuaca: {format(fromUnixTime(selectedForecast.dt), 'd MMM yyyy, HH:mm', { locale: id })}</DialogTitle>
                    </DialogHeader>
                     <div className="py-4 space-y-4">
                        <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                            <Image
                                src={`https://openweathermap.org/img/wn/${selectedForecast.weather[0].icon}@4x.png`}
                                alt={selectedForecast.weather[0].description}
                                width={100}
                                height={100}
                            />
                            <div className="text-center">
                                <p className="text-5xl font-bold">{Math.round(selectedForecast.main.temp)}°C</p>
                                <p className="capitalize text-muted-foreground">{selectedForecast.weather[0].description}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <DetailInfoRow icon={Thermometer} label="Terasa Seperti" value={`${Math.round(selectedForecast.main.feels_like)}°C`} />
                            <Separator />
                            <DetailInfoRow icon={Droplets} label="Kelembapan" value={`${selectedForecast.main.humidity}%`} />
                            <Separator />
                            <DetailInfoRow icon={Wind} label="Kecepatan Angin" value={`${selectedForecast.wind.speed.toFixed(1)} m/s`} />
                            <Separator />
                            <DetailInfoRow icon={Cloud} label="Tutupan Awan" value={`${selectedForecast.clouds.all}%`} />
                             <Separator />
                            <DetailInfoRow icon={Eye} label="Jarak Pandang" value={`${(selectedForecast.visibility / 1000).toFixed(1)} km`} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>

    </div>
    </>
  );
}

    
