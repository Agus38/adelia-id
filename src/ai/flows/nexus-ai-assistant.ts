'use server';

/**
 * @fileOverview Titik masuk (entrypoint) sisi server untuk Nexus AI Assistant.
 * File ini diekspos ke komponen klien sebagai Server Action.
 */

import type { AssistantInput, AssistantOutput } from './nexus-ai-flow';
import { nexusAssistantFlow } from './nexus-ai-flow';


// This is the main exported function that client components will call.
// It adheres to the 'use server' constraint of only exporting async functions.
export async function nexusAssistant(input: AssistantInput): Promise<AssistantOutput> {
  // The actual Genkit flow logic is in a separate file.
  return nexusAssistantFlow(input);
}
