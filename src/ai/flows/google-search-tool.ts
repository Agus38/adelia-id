
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const googleSearch = ai.defineTool(
  {
    name: 'googleSearch',
    description: 'Search Google for information. Use this for real-time information, news, or any topic you do not have information about.',
    inputSchema: z.object({
      query: z.string().describe('The search query'),
    }),
    outputSchema: z.string().describe('A summary of the search results.'),
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
      return 'Maaf, tool pencarian Google tidak dikonfigurasi. Administrator perlu mengatur GOOGLE_API_KEY dan GOOGLE_CX di environment variables.';
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(input.query)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return 'Maaf, terjadi kesalahan saat melakukan pencarian.';
      }
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const results = data.items.slice(0, 3).map((item: any) => `Judul: ${item.title}\nRingkasan: ${item.snippet}\nTautan: ${item.link}`).join('\n\n');
        return `Berikut adalah hasil teratas dari pencarian Google:\n${results}`;
      } else {
        return 'Tidak ada hasil yang ditemukan untuk pencarian Anda.';
      }
    } catch (error) {
      console.error('Error with Google Search tool:', error);
      return 'Maaf, terjadi kesalahan saat menghubungkan ke layanan pencarian.';
    }
  }
);
