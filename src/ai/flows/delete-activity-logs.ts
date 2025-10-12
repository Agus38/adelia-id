
'use server';

/**
 * @fileOverview A flow to delete activity logs from Firestore.
 * 
 * - deleteActivityLogs - A server action that triggers the log deletion flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { startOfToday } from 'date-fns';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
    // In a production environment, use application default credentials
    // by not passing any argument to initializeApp().
    // For local development, you might use a service account key.
    initializeApp();
}

const adminDb = getFirestore();

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
      const logsCollection = adminDb.collection('activityLogs');
      let logsQuery;

      if (period === 'all') {
        logsQuery = logsCollection;
      } else {
        const todayStart = Timestamp.fromDate(startOfToday());
        if (period === 'today') {
            logsQuery = logsCollection.where('timestamp', '>=', todayStart);
        } else { // 'old'
            logsQuery = logsCollection.where('timestamp', '<', todayStart);
        }
      }

      const snapshot = await logsQuery.get();
      if (snapshot.empty) {
        return { success: true, deletedCount: 0 };
      }
      
      const batch = adminDb.batch();
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
