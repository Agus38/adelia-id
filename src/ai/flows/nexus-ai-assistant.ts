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

const NexusAIAssistantInputSchema = z.object({
  query: z.string().describe('The user query for the AI assistant.'),
});
export type NexusAIAssistantInput = z.infer<typeof NexusAIAssistantInputSchema>;

const NexusAIAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the query.'),
});
export type NexusAIAssistantOutput = z.infer<typeof NexusAIAssistantOutputSchema>;

export async function nexusAIAssistant(input: NexusAIAssistantInput): Promise<NexusAIAssistantOutput> {
  return nexusAIAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nexusAIAssistantPrompt',
  input: {schema: NexusAIAssistantInputSchema},
  output: {schema: NexusAIAssistantOutputSchema},
  prompt: `You are an AI assistant for the Adelia-ID application. Your purpose is to assist users with tasks and answer questions related to the application.

User Query: {{{query}}}

Response:`,
});

const nexusAIAssistantFlow = ai.defineFlow(
  {
    name: 'nexusAIAssistantFlow',
    inputSchema: NexusAIAssistantInputSchema,
    outputSchema: NexusAIAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
