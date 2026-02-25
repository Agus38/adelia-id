'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'Get the current stock price for a given ticker symbol.',
    inputSchema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., AAPL for Apple.'),
    }),
    outputSchema: z.string().describe('A descriptive string of the stock price.'),
  },
  async (input) => {
    const apiKey = process.env.FMP_API_KEY; // Financial Modeling Prep API Key
    if (!apiKey) {
      return 'Maaf, tool harga saham tidak dikonfigurasi. Administrator perlu mengatur FMP_API_KEY di environment variables.';
    }
    
    const url = `https://financialmodelingprep.com/api/v3/quote-short/${input.ticker.toUpperCase()}?apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Maaf, saya tidak dapat menemukan data untuk ticker ${input.ticker}.`;
      }
      const data = await response.json();
      
      if (data && data.length > 0) {
        const stock = data[0];
        return `Harga saham untuk ${stock.symbol} saat ini adalah $${stock.price.toFixed(2)}.`;
      } else {
        return `Tidak ada data harga saham yang ditemukan untuk ticker ${input.ticker}.`;
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
      return 'Maaf, terjadi kesalahan saat mengambil data harga saham.';
    }
  }
);
