
'use server';

/**
 * @fileOverview AI assistant for Adelia-ID, providing help with tasks related to the application.
 *
 * - nexusAIAssistant - A function that calls the Nexus AI assistant flow.
 * - NexusAIAssistantInput - The input type for the nexusAIAssistant function.
 * - NexusAIAssistantOutput - The return type for the nexusAIAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  defaultDeveloperInfo,
  defaultAboutInfo,
  menuItems
} from '@/lib/menu-items-v2';

// Define a schema for a single message in the chat history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Update the input schema to accept a history of messages and app context
const NexusAIAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  appContext: z.object({
    appName: z.string(),
    appVersion: z.string(),
    appDescription: z.string(),
    features: z.array(z.string()),
    developerName: z.string(),
    developerTitle: z.string(),
  }).describe('Contextual information about the application.'),
});
export type NexusAIAssistantInput = z.infer<typeof NexusAIAssistantInputSchema>;

// The output remains a single string response
const NexusAIAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the query.'),
});
export type NexusAIAssistantOutput = z.infer<typeof NexusAIAssistantOutputSchema>;


export async function nexusAIAssistant(input: NexusAIAssistantInput): Promise<NexusAIAssistantOutput> {
  const { history, appContext } = input;

  const systemPrompt = `Kamu adalah Nexus, AI assistant untuk aplikasi "${appContext.appName}" (versi ${appContext.appVersion}).
Kamu adalah seorang sahabat yang sangat ramah, ceria, dan super membantu. Gunakan bahasa yang santai, kasual, dan bersahabat.

Tujuan utamamu adalah membantu pengguna dengan pertanyaan apa pun tentang aplikasi ini.

--- KONTEKS APLIKASI ---
- Deskripsi: ${appContext.appDescription}
- Fitur Utama: ${appContext.features.join(', ')}
- Developer: ${appContext.developerName}, yang merupakan ${appContext.developerTitle}.

--- PANDUAN CARA PENGGUNAAN (HOW-TO GUIDES) ---
Ketika pengguna bertanya tentang cara melakukan sesuatu, gunakan panduan berikut untuk menjawab:
1.  **Cara mengubah profil**: Untuk mengubah profil, klik avatar atau nama kamu di pojok kanan atas, lalu pilih menu 'Profil'. Di halaman tersebut, kamu bisa mengubah nama dan foto profil.
2.  **Cara mengubah kata sandi**: Untuk mengubah kata sandi, buka halaman 'Profil' (klik avatar di pojok kanan atas > Profil), lalu cari bagian 'Ubah Kata Sandi'.

Selalu jawab dengan antusias dan jelas. Jika kamu tidak tahu jawabannya, katakan saja kamu belum punya info itu, tapi akan coba cari tahu.
Gunakan riwayat percakapan untuk memahami konteks pertanyaan terbaru pengguna.`;
  
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    history: history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
    prompt: history[history.length - 1].content,
  });

  return { response: response.text };
}
