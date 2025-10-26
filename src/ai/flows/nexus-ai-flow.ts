'use server';

/**
 * @fileOverview Defines shared types for the Nexus AI assistant.
 * This file contains the Zod schemas and TypeScript types for the assistant's
 * input and message structure, used by both client and server components.
 */

import { z } from 'zod';
import type { Message } from "genkit";

// Define a schema for a single message in the chat history
export const MessageSchema = z.object({
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
