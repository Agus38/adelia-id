
'use server';

/**
 * @fileOverview Titik masuk (entrypoint) sisi server untuk Nexus AI Assistant.
 * File ini diekspos ke komponen klien sebagai Server Action.
 */

import type { AssistantInput } from './nexus-ai-flow';
import { nexusAssistantFlow } from './nexus-ai-flow';

// This is the main exported function that client components will call.
// It adheres to the 'use server' constraint and is now adapted for streaming.
export async function nexusAssistant(input: AssistantInput): Promise<ReadableStream<string>> {
  // The actual Genkit flow logic is in a separate file.
  // The flow itself will now return a stream.
  return nexusAssistantFlow(input);
}
