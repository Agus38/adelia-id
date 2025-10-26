'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Use this tool to get the current time. It does not take any input.',
    inputSchema: z.object({}),
    outputSchema: z.string().describe("The current time formatted as HH:mm:ss, e.g., '14:30:15 WIB'"),
  },
  async () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta' // WIB
    });
    return `${timeString} WIB`;
  }
);
