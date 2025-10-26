/**
 * @fileOverview This file contains the actual Genkit flow and schema definitions
 * for the Nexus AI Assistant. It is NOT marked with "use server" and is intended
 * for internal use by the server-side `nexus-ai-assistant.ts` file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    userAvatar: z.string().optional().describe("URL of the user's avatar."),
    userRole: z.string().optional().describe("The user's role (e.g., Admin, Pengguna)."),
  }).describe('Contextual information about the app state and user.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

// Define the output schema for the assistant's response
export const AssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's final response to the user."),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;


// Define the Genkit flow for the Nexus AI Assistant
export const nexusAssistantFlow = ai.defineFlow(
  {
    name: 'nexusAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    // Construct the system prompt with context
    const systemPrompt = `
      You are Nexus, a helpful and friendly AI assistant integrated into the Adelia-ID application.
      Your primary role is to assist users with their tasks, answer questions about the application, and provide support.
      You are currently interacting with a user named "${input.appContext.userName || 'Pengguna'}" who has the role of "${input.appContext.userRole || 'Pengguna'}".
      
      Always be polite, professional, and concise.
      Use the provided conversation history to maintain context.
    `;

    // Extract the latest user message from the history to use as the prompt
    const latestUserMessage = input.history.findLast(msg => msg.role === 'user');

    // Generate the response from the model
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      history: input.history.map(msg => ({ role: msg.role, content: [{ text: msg.content }] })),
      prompt: latestUserMessage?.content || "Hello.", // Use latest message or a default greeting
      config: { temperature: 0.7 },
    });

    return { response: response.text };
  }
);
