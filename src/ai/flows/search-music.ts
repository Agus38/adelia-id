
'use server';

/**
 * @fileOverview A flow to search for music on YouTube Music via RapidAPI.
 * 
 * - searchMusic - A server action that triggers the music search flow.
 * - SearchMusicInput - The input type for the searchMusic function.
 * - SearchMusicOutput - The return type for the searchMusic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SearchMusicInputSchema = z.object({
  query: z.string().describe('The search term for music, e.g., an artist or song title.'),
});

const TrackSchema = z.object({
    videoId: z.string(),
    title: z.string(),
    artists: z.array(z.object({ name: z.string() })).optional(),
    thumbnailUrl: z.string().url(),
    duration: z.object({
        totalSeconds: z.number(),
        label: z.string(),
    }),
    url: z.string().url().describe("Direct streamable URL for the music."),
});

const SearchMusicOutputSchema = z.object({
    tracks: z.array(TrackSchema).describe("A list of tracks found."),
});

export type SearchMusicInput = z.infer<typeof SearchMusicInputSchema>;
export type SearchMusicOutput = z.infer<typeof SearchMusicOutputSchema>;


export async function searchMusic(input: SearchMusicInput): Promise<SearchMusicOutput> {
  return searchMusicFlow(input);
}


const searchMusicFlow = ai.defineFlow(
  {
    name: 'searchMusicFlow',
    inputSchema: SearchMusicInputSchema,
    outputSchema: SearchMusicOutputSchema,
  },
  async ({ query }) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RapidAPI key is not configured in .env file.');
    }

    // Step 1: Search for tracks to get their video IDs, ensuring we search for songs specifically.
    const searchUrl = `https://youtube-music-api3.p.rapidapi.com/search?q=${encodeURIComponent(query)}&type=song`;
    
    const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'youtube-music-api3.p.rapidapi.com'
        }
    });

    if (!searchResponse.ok) {
        const errorBody = await searchResponse.text();
        console.error("RapidAPI Search Error:", errorBody);
        throw new Error(`YouTube Music API search request failed with status: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    
    if (!searchResult.results?.songs?.items || !Array.isArray(searchResult.results.songs.items)) {
        console.error('Unexpected search response format from API:', searchResult);
        return { tracks: [] };
    }

    const foundTracks = searchResult.results.songs.items;
    
    // Step 2: For each track, get the download URL
    const tracksWithUrls = await Promise.all(foundTracks.slice(0, 5).map(async (track: any) => { // Limit to 5 for performance
        const downloadUrl = `https://youtube-music-api3.p.rapidapi.com/download?videoId=${track.videoId}`;
        const downloadResponse = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'youtube-music-api3.p.rapidapi.com'
            }
        });

        if (!downloadResponse.ok) {
            console.error(`Failed to get download URL for videoId: ${track.videoId}`);
            return null;
        }

        const downloadResult = await downloadResponse.json();
        
        if (downloadResult.status !== 'OK' || !downloadResult.audioUrl) {
            return null;
        }

        return {
            videoId: track.videoId,
            title: track.title,
            artists: track.artists || [],
            thumbnailUrl: track.thumbnailUrl,
            duration: {
                totalSeconds: track.duration?.totalSeconds || 0,
                label: track.duration?.label || '0:00'
            },
            url: downloadResult.audioUrl,
        };
    }));
    
    const validTracks = tracksWithUrls.filter(Boolean) as z.infer<typeof TrackSchema>[];
    
    return { tracks: validTracks };
  }
);
