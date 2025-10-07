
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

    const searchUrl = `https://youtube-music-api3.p.rapidapi.com/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'youtube-music-api3.p.rapidapi.com'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("RapidAPI Error:", errorBody);
        throw new Error(`YouTube Music API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.results?.tracks?.items || !Array.isArray(result.results.tracks.items)) {
        console.error('Unexpected response format from API:', result);
        return { tracks: [] };
    }

    const tracks = result.results.tracks.items.map((track: any) => ({
        videoId: track.videoId,
        title: track.title,
        artists: track.artists || [],
        thumbnailUrl: track.thumbnailUrl,
        url: track.audioUrl,
    })).filter((track: any) => track.url); // Ensure only tracks with an audio URL are included
    
    return { tracks };
  }
);
