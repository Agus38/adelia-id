
'use server';

/**
 * @fileOverview A flow to delete activity logs from Firestore.
 * 
 * - deleteActivityLogs - A server action that triggers the log deletion flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfToday } from 'date-fns';

const DeleteLogsInputSchema = z.object({
  period: z.enum(['all', 'today', 'old']),
});

const DeleteLogsOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
  error: z.string().optional(),
});

export type DeleteLogsInput = z.infer<typeof DeleteLogsInputSchema>;
export type DeleteLogsOutput = z.infer<typeof DeleteLogsOutputSchema>;


export async function deleteActivityLogs(input: DeleteLogsInput): Promise<DeleteLogsOutput> {
  return deleteActivityLogsFlow(input);
}


const deleteActivityLogsFlow = ai.defineFlow(
  {
    name: 'deleteActivityLogsFlow',
    inputSchema: DeleteLogsInputSchema,
    outputSchema: DeleteLogsOutputSchema,
  },
  async ({ period }) => {
    try {
      const logsCollection = collection(db, 'activityLogs');
      let logsQuery;

      if (period === 'all') {
        logsQuery = logsCollection;
      } else {
        const todayStart = Timestamp.fromDate(startOfToday());
        if (period === 'today') {
            logsQuery = query(logsCollection, where('timestamp', '>=', todayStart));
        } else { // 'old'
            logsQuery = query(logsCollection, where('timestamp', '<', todayStart));
        }
      }

      const snapshot = await getDocs(logsQuery);
      if (snapshot.empty) {
        return { success: true, deletedCount: 0 };
      }
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      return {
        success: true,
        deletedCount: snapshot.size,
      };

    } catch (error: any) {
      console.error('Error deleting activity logs:', error);
      return {
        success: false,
        deletedCount: 0,
        error: error.message || 'An unknown error occurred.',
      };
    }
  }
);
