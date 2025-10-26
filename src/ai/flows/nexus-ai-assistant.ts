'use server';

/**
 * @fileOverview Titik masuk (entrypoint) sisi server untuk Nexus AI Assistant.
 * File ini diekspos ke komponen klien sebagai Server Action dan bertanggung jawab
 * untuk mengeksekusi prompt dan mengalirkan respons.
 */

import { nexusAssistantPrompt, type AssistantInput } from './nexus-ai-flow';
import { streamToReadableStream } from 'ai';

export async function nexusAssistant(input: AssistantInput): Promise<ReadableStream<string>> {
  
  const fullSystemPrompt = {
    role: 'system',
    content: `You are currently interacting with a user named "${input.appContext.userName || 'Pengguna'}" who has the role of "${input.appContext.userRole || 'Pengguna'}".`
  };

  const { stream } = await nexusAssistantPrompt(
    {
        history: [fullSystemPrompt, ...input.history]
    },
    { streaming: true }
  );

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
