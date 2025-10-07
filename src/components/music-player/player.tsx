
'use client';

import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Play, Pause, SkipForward, SkipBack, Loader2, Music, Shuffle, Repeat } from "lucide-react";
import { searchMusic } from '@/ai/flows/search-music';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface Track {
    videoId: string;
    title: string;
    artists?: { name: string }[];
    thumbnailUrl: string;
    url: string;
}

export function MusicPlayer() {
    const [query, setQuery] = React.useState('Bondan Prakoso');
    const [playlist, setPlaylist] = React.useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const { toast } = useToast();
    
    const handleSearch = React.useCallback(async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setPlaylist([]);
        try {
            const result = await searchMusic({ query });
            if (result.tracks && result.tracks.length > 0) {
                setPlaylist(result.tracks);
                setCurrentTrackIndex(0);
            } else {
                toast({
                    title: "Tidak Ada Hasil",
                    description: `Tidak ada musik yang ditemukan untuk "${query}".`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Gagal Mencari Musik",
                description: "Tidak dapat terhubung ke layanan musik. Coba lagi nanti.",
                variant: "destructive"
            });
            console.error("Music search error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [query, toast]);
    
    React.useEffect(() => {
        handleSearch();
    }, []);

    React.useEffect(() => {
        if (audioRef.current && playlist.length > 0 && playlist[currentTrackIndex]?.url) {
            audioRef.current.src = playlist[currentTrackIndex].url;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
            }
        }
    }, [currentTrackIndex, playlist, isPlaying]);
    
    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
        setIsPlaying(!isPlaying);
    };
    
    const playNext = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        if (!isPlaying) setIsPlaying(true);
    };

    const playPrev = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        if (!isPlaying) setIsPlaying(true);
    };

    const currentTrack = playlist[currentTrackIndex];

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-4">
                <Input 
                    placeholder="Cari lagu atau artis..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                </Button>
            </div>
            
            <Card className="rounded-3xl shadow-neumorphic-light p-4 sm:p-6">
                <CardContent className="p-0 flex flex-col items-center gap-4 sm:gap-6">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                       {isLoading ? (
                           <Skeleton className="w-full h-full rounded-2xl" />
                       ) : currentTrack ? (
                             <Image
                                src={currentTrack.thumbnailUrl}
                                alt={currentTrack.title}
                                fill
                                className="rounded-2xl object-cover shadow-lg"
                                data-ai-hint="album cover"
                            />
                       ) : (
                           <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center">
                               <Music className="h-16 w-16 text-muted-foreground"/>
                           </div>
                       )}
                    </div>
                    
                    <div className="text-center h-14">
                         {isLoading ? (
                            <div className="space-y-2">
                                 <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32 mx-auto" />
                            </div>
                        ) : currentTrack ? (
                             <>
                                <h2 className="text-xl font-bold truncate px-2">{currentTrack.title}</h2>
                                <p className="text-muted-foreground text-sm truncate px-2">{currentTrack.artists?.map(a => a.name).join(', ')}</p>
                             </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold">Pemutar Musik</h2>
                                <p className="text-muted-foreground text-sm">Cari untuk memulai</p>
                            </>
                        )}
                    </div>

                    <div className="w-full flex items-center justify-center gap-2 sm:gap-4">
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full hidden sm:flex" disabled>
                           <Shuffle className="h-5 w-5" />
                        </Button>
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" onClick={playPrev} disabled={playlist.length === 0}>
                           <SkipBack className="h-5 w-5" />
                        </Button>
                         <Button variant="neumorphic" size="icon" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground" onClick={togglePlayPause} disabled={playlist.length === 0}>
                            {isPlaying ? <Pause className="h-6 sm:h-8 w-6 sm:w-8" /> : <Play className="h-6 sm:h-8 w-6 sm:w-8" />}
                        </Button>
                         <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" onClick={playNext} disabled={playlist.length === 0}>
                           <SkipForward className="h-5 w-5" />
                        </Button>
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full hidden sm:flex" disabled>
                           <Repeat className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <audio ref={audioRef} onEnded={playNext} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
}
