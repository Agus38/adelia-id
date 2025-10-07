
'use client';

import { MusicPlayer } from "@/components/music-player/player";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2, Music } from "lucide-react";

export default function MusicPlayerPage() {
  const { hasAccess, isLoading } = usePageAccess('music-player');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null; // The hook handles redirection.
  }


  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 items-center justify-center">
        <div className="w-full max-w-md">
            <MusicPlayer />
        </div>
    </div>
  );
}
