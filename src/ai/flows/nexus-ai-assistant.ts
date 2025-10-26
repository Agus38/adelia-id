
'use server';

/**
 * @fileOverview The main flow for the Nexus AI Assistant.
 * This flow handles the conversation logic, context management,
 * and tool integration for the AI assistant.
 *
 * - nexusAssistant - The main function to call the assistant.
 * - AssistantInput - The input schema for the assistant.
 * - AssistantOutput - The output schema for the assistant.
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

// This is the main exported function that client components will call.
export async function nexusAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return nexusAssistantFlow(input);
}

// Define the Genkit flow for the Nexus AI Assistant
const nexusAssistantFlow = ai.defineFlow(
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

    // Generate the response from the model
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      history: input.history.map(msg => ({ role: msg.role, content: [{ text: msg.content }] })),
      prompt: input.history[input.history.length - 1].content,
      config: { temperature: 0.7 },
    });

    return { response: response.text };
  }
);
