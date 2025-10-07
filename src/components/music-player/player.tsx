
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
    artists: { name: string }[];
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
    
    React.useEffect(() => {
        handleSearch();
    }, []);

    React.useEffect(() => {
        if (audioRef.current && playlist.length > 0) {
            audioRef.current.src = playlist[currentTrackIndex].url;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback error:", e));
            }
        }
    }, [currentTrackIndex, playlist]);
    
    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setPlaylist([]);
        try {
            const result = await searchMusic({ query });
            setPlaylist(result.tracks);
            setCurrentTrackIndex(0);
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
    };

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
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const playPrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
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
            
            <Card className="rounded-3xl shadow-neumorphic-light p-6">
                <CardContent className="p-0 flex flex-col items-center gap-6">
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
                    
                    <div className="text-center">
                         {isLoading ? (
                            <div className="space-y-2">
                                 <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32 mx-auto" />
                            </div>
                        ) : currentTrack ? (
                             <>
                                <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
                                <p className="text-muted-foreground text-sm truncate">{currentTrack.artists.map(a => a.name).join(', ')}</p>
                             </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold">Pemutar Musik</h2>
                                <p className="text-muted-foreground text-sm">Cari untuk memulai</p>
                            </>
                        )}
                    </div>

                    <div className="w-full flex items-center justify-center gap-4">
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" disabled>
                           <Shuffle className="h-5 w-5" />
                        </Button>
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" onClick={playPrev} disabled={playlist.length === 0}>
                           <SkipBack className="h-5 w-5" />
                        </Button>
                         <Button variant="neumorphic" size="icon" className="w-20 h-20 rounded-full bg-primary text-primary-foreground" onClick={togglePlayPause} disabled={playlist.length === 0}>
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                         <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" onClick={playNext} disabled={playlist.length === 0}>
                           <SkipForward className="h-5 w-5" />
                        </Button>
                        <Button variant="neumorphic" size="icon" className="w-12 h-12 rounded-full" disabled>
                           <Repeat className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <audio ref={audioRef} onEnded={playNext} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} className="hidden" />
        </div>
    );
}
