'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const convertCurrency = ai.defineTool(
  {
    name: 'convertCurrency',
    description: 'Convert an amount from one currency to another.',
    inputSchema: z.object({
      amount: z.number().describe('The amount of money to convert.'),
      from: z.string().describe('The currency code to convert from (e.g., USD, EUR, IDR).'),
      to: z.string().describe('The currency code to convert to (e.g., USD, EUR, IDR).'),
    }),
    outputSchema: z.string().describe('The result of the currency conversion.'),
  },
  async (input) => {
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (!apiKey) {
      return 'Maaf, tool konversi mata uang tidak dikonfigurasi. Administrator perlu mengatur EXCHANGERATE_API_KEY di environment variables.';
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${input.from}/${input.to}/${input.amount}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Maaf, saya tidak dapat mengonversi dari ${input.from} ke ${input.to}.`;
      }
      const data = await response.json();
      
      if (data.result === 'success') {
        const fromAmountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.from }).format(input.amount);
        const toAmountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.to }).format(data.conversion_result);
        return `${fromAmountFormatted} setara dengan sekitar ${toAmountFormatted}.`;
      } else {
        return `Gagal melakukan konversi mata uang. Error: ${data['error-type']}`;
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      return 'Maaf, terjadi kesalahan saat menghubungkan ke layanan nilai tukar.';
    }
  }
);
