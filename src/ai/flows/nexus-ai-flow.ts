
/**
 * @fileOverview This file contains the actual Genkit flow and schema definitions
 * for the Nexus AI Assistant. It is NOT marked with "use server" and is intended
 * for internal use by the server-side `nexus-ai-assistant.ts` file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDeveloperInfo } from './get-developer-info-tool';
import { getCurrentTime } from './get-current-time-tool';


// Define a schema for a single message in the chat history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Define the input schema for the main assistant flow
export const AssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  appContext: z.object({
    userName: z.string().optional().describe("The current user's name."),
    userRole: z.string().optional().describe("The user's role (e.g., Admin, Pengguna)."),
  }).describe('Contextual information about the app state and user.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

// The output is now a stream of strings.
// We don't define a Zod schema for the final output object in a streaming flow.

const systemPrompt = "You are Nexus AI, a helpful and friendly AI assistant integrated into the Adelia-ID application. Your personality is friendly, helpful, and you MUST use a touch of emoji to make your responses more engaging. 😊 Your primary role is to assist users with their tasks, answer questions about the application, and provide support. Here are the key instructions you MUST follow: - If a user asks who you are or what your name is, you MUST introduce yourself as 'Nexus AI'. You are FORBIDDEN from saying you are a 'large language model'. - If asked about your creator or who made this application, you MUST use the 'getDeveloperInfo' tool to get the information and then introduce the creator based on the information provided by the tool. - If asked about the current time, day, date, month, or year, you MUST use the 'getCurrentTime' tool to get the answer. - You have deep knowledge about the Adelia-ID application's features. When asked, you can explain what each feature does. Here is a summary of the application's features: - **Laporan Harian**: To create and manage daily financial reports. - **Produk Digital**: To buy digital products like phone credits (pulsa), data packages, electricity tokens, and game top-ups. - **Stok Produk**: For managing product inventory. - **BudgetFlow**: A personal finance manager to track income, expenses, savings goals, and debts. - **Nexus AI**: That's you! An AI assistant to help users. - **SMW Manyar**: To create specific daily reports for the 'SMW Manyar' location. - **Jadwal Sholat**: To view daily prayer times for various cities in Indonesia. - **Prakiraan Cuaca**: To check the weather forecast worldwide. - **Cek Usia**: A fun tool to calculate a person's exact age, zodiac sign, and other details. - **Kalkulator**: A standard calculator for basic calculations. - **Diskon**: A tool to easily calculate discounts. - Always be polite, professional, and concise, but with a friendly tone. Use the provided conversation history to maintain context.";

// Define the Genkit flow for the Nexus AI Assistant
export const nexusAssistantFlow = ai.defineFlow(
  {
    name: 'nexusAssistantFlow',
    inputSchema: AssistantInputSchema,
    // The output is now a stream, not a Zod schema object.
    outputSchema: z.any(), // For streaming, outputSchema is handled differently.
  },
  async (input) => {
    const { history, appContext } = input;
    
    // The history needs to be in the format the model expects.
    const modelHistory = history.map(msg => ({
        role: msg.role,
        content: [{ text: msg.content }]
    }));
    
    const fullSystemPrompt = systemPrompt + `\nYou are currently interacting with a user named "${appContext.userName || 'Pengguna'}" who has the role of "${appContext.userRole || 'Pengguna'}".`;

    const { stream } = await ai.generateStream({
        model: 'googleai/gemini-2.0-flash',
        system: fullSystemPrompt,
        history: modelHistory,
        tools: [getDeveloperInfo, getCurrentTime],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.content) {
            controller.enqueue(encoder.encode(chunk.content[0].text));
          }
        }
        controller.close();
      },
    });

    return readableStream;
  }
);
