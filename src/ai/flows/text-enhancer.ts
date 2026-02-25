
'use server';

/**
 * @fileOverview A flow to enhance and rephrase text to be more professional and clear.
 * 
 * - enhanceText - A server action that takes a string and returns an improved version.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EnhanceTextInputSchema = z.object({
  text: z.string().describe('The text to be enhanced.'),
});
export type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
  enhancedText: z.string().describe('The enhanced, more professional version of the text.'),
});
export type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;


export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  return enhanceTextFlow(input);
}


const enhanceTextFlow = ai.defineFlow(
  {
    name: 'enhanceTextFlow',
    inputSchema: EnhanceTextInputSchema,
    outputSchema: EnhanceTextOutputSchema,
  },
  async ({ text }) => {
    const prompt = `
      Anda adalah seorang editor tulisan profesional. Tugas Anda adalah memperbaiki dan menyusun ulang teks yang diberikan oleh pengguna menjadi kalimat yang lebih jelas, profesional, dan tata bahasanya benar.
      - Perbaiki kesalahan ejaan dan tanda baca.
      - Susun ulang kalimat agar lebih mudah dibaca dan dipahami.
      - Gunakan pilihan kata yang lebih formal dan profesional.
      - Pastikan makna asli dari teks tetap terjaga.

      Teks yang perlu diperbaiki:
      ---
      ${text}
      ---
      
      Hasil perbaikan:
    `;

    const response = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.0-flash',
      config: { temperature: 0.5 },
    });
    
    return { enhancedText: response.text.trim() };
  }
);
