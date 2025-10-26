'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Use this tool to get the current day, date, month, year, and time. It does not take any input.',
    inputSchema: z.object({}),
    outputSchema: z.string().describe("The current date and time formatted as 'Hari, DD MMMM YYYY, HH:mm:ss WIB', e.g., 'Senin, 29 Juli 2024, 14:30:15 WIB'"),
  },
  async () => {
    const now = new Date();
    const dateTimeString = now.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta' // WIB
    }).replace(/\./g, ':');
    
    return `${dateTimeString} WIB`;
  }
);
