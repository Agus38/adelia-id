'use server';

/**
 * @fileOverview AI assistant for Adelia-ID, providing help with tasks related to the application.
 *
 * - nexusAIAssistant - A function that calls the Nexus AI assistant flow.
 * - NexusAIAssistantInput - The input type for the nexusAIAssistant function.
 * - NexusAIAssistantOutput - The return type for the nexusAIAssistant function.
 */

import {ai} from '@/ai/genkit';
import {generate} from 'genkit/ai';
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

  const systemPrompt = `You are an AI assistant for the "${appContext.appName}" application (version ${appContext.appVersion}).
Your purpose is to be helpful and friendly, assisting users with their questions about the application.

Here is some context about the application:
- Description: ${appContext.appDescription}
- Key Features: ${appContext.features.join(', ')}
- Developer: ${appContext.developerName}, who is the ${appContext.developerTitle}.

Your persona is professional, but approachable. Answer concisely and clearly.
Do not make up features that don't exist. If you don't know an answer, say that you don't have that information.
The user's conversation history is provided. Use it to understand the context of their latest query.`;

  const model = ai.model('googleai/gemini-2.0-flash');
  
  const response = await generate({
    model,
    system: systemPrompt,
    history: history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
    prompt: history[history.length - 1].content,
  });

  return { response: response.text };
}
