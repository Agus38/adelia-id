
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
import { reportIssue } from './report-issue-flow';
import { type Part } from '@genkit-ai/google-genai';

// Define a schema for a single message in the chat history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Update the input schema to accept a history of messages and app context
const NexusAIAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  userName: z.string().describe("The current user's name."),
  userAvatar: z.string().describe("The current user's avatar URL."),
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
  const { history, appContext, userName, userAvatar } = input;

  const systemPrompt = `Kamu adalah Nexus, AI assistant untuk aplikasi "${appContext.appName}" (versi ${appContext.appVersion}).
Kamu adalah seorang sahabat yang sangat ramah, ceria, dan super membantu. Gunakan bahasa yang santai, kasual, dan bersahabat.
Kamu sedang berbicara dengan pengguna bernama "${userName}". Sapa mereka dengan namanya jika memungkinkan untuk membuat percakapan lebih akrab.

Tujuan utamamu adalah membantu pengguna dengan pertanyaan apa pun tentang aplikasi ini.

--- PANDUAN ---
1.  **Menjawab Pertanyaan**: Jawab pertanyaan pengguna tentang cara menggunakan aplikasi, fitur, atau informasi umum berdasarkan konteks yang diberikan.
2.  **Menangani Keluhan**: Jika pengguna menyampaikan keluhan, masalah, bug, atau error (contoh: "kenapa aplikasinya lambat?", "fitur X tidak berfungsi", "saya tidak suka tampilan baru"), kamu HARUS menggunakan tool \`reportIssue\` untuk mencatat keluhan tersebut. Setelah itu, berikan respons yang empatik seperti "Terima kasih atas laporannya, akan segera kami teruskan ke tim developer."
3.  **How-To Guides**: Ketika pengguna bertanya tentang cara melakukan sesuatu, gunakan panduan berikut untuk menjawab:
    *   **Cara mengubah profil**: Untuk mengubah profil, klik avatar atau nama kamu di pojok kanan atas, lalu pilih menu 'Profil'. Di halaman tersebut, kamu bisa mengubah nama dan foto profil.
    *   **Cara mengubah kata sandi**: Untuk mengubah kata sandi, buka halaman 'Profil' (klik avatar di pojok kanan atas > Profil), lalu cari bagian 'Ubah Kata Sandi'.

Selalu jawab dengan antusias dan jelas. Jika kamu tidak tahu jawabannya, katakan saja kamu belum punya info itu, tapi akan coba cari tahu.
Gunakan riwayat percakapan untuk memahami konteks pertanyaan terbaru pengguna.

--- KONTEKS APLIKASI ---
- Deskripsi: ${appContext.appDescription}
- Fitur Utama: ${appContext.features.join(', ')}
- Developer: ${appContext.developerName}, yang merupakan ${appContext.developerTitle}.`;
  
  const currentPrompt = history.length > 0 ? history[history.length - 1].content : "Sapa pengguna.";
  const conversationHistory = history.slice(0, -1); 
  
  try {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      prompt: currentPrompt,
      tools: [reportIssue],
      history: conversationHistory.map(h => ({
          role: h.role,
          content: [{ text: h.content }],
      })),
    });

    const toolRequest = llmResponse.toolRequest();
    
    if (toolRequest) {
        // The tool's declared inputSchema is { issueDescription: string }.
        // We augment this with userName and userAvatar for the log.
        const augmentedInput = { 
            ...toolRequest.input, 
            userName, 
            userAvatar 
        };
        
        const toolResponse = await toolRequest.run(augmentedInput);

        const toolResponsePart: Part = {
            toolResponse: {
                name: toolRequest.name,
                response: toolResponse,
            }
        };

        const finalResponse = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            system: systemPrompt,
            history: [
                ...conversationHistory.map(h => ({ role: h.role, content: [{ text: h.content }] })),
                { role: 'user', content: [{ text: currentPrompt }] },
                llmResponse.requestAsMessage,
                { role: 'model', content: [toolResponsePart] }
            ]
        });

        return { response: finalResponse.text };
    }
    
    return { response: llmResponse.text };

  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return { response: 'Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.' };
  }
}
