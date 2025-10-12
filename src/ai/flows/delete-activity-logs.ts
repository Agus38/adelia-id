'use server';

/**
 * @fileOverview A flow to delete activity logs from Firestore.
 * 
 * - deleteActivityLogs - A server action that triggers the log deletion flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { startOfToday } from 'date-fns';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG 
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG) 
  : undefined;

if (getApps().length === 0) {
    initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
    });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

const DeleteLogsInputSchema = z.object({
  period: z.enum(['all', 'today', 'old']),
  idToken: z.string(),
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
  async ({ period, idToken }) => {
    try {
      // 1. Verify the user's token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // 2. Check if the user is an Admin
      if (decodedToken.role !== 'Admin') {
          throw new Error('Hanya administrator yang dapat menghapus log.');
      }
      
      // 3. Proceed with deletion logic
      const logsCollection = adminDb.collection('activityLogs');
      let query;

      if (period === 'all') {
        query = logsCollection;
      } else {
        const todayStart = AdminTimestamp.fromDate(startOfToday());
        if (period === 'today') {
            query = logsCollection.where('timestamp', '>=', todayStart);
        } else { // 'old'
            query = logsCollection.where('timestamp', '<', todayStart);
        }
      }

      const snapshot = await query.get();
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
