
'use server';

/**
 * @fileOverview A flow to delete activity logs.
 * 
 * - deleteActivityLogs - A server action that triggers the log deletion flow.
 * - DeleteLogsInput - The input type for the function.
 * - DeleteLogsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
  : undefined;

// Use a unique name for the admin app instance to avoid conflicts
const adminApp = getApps().find(app => app.name === 'log-deletion') || initializeApp(
    serviceAccount
        ? { credential: cert(serviceAccount) }
        : { projectId: 'aeromenu' },
    'log-deletion'
);


const adminDb = getFirestore(adminApp);

const DeleteLogsInputSchema = z.object({
  filter: z.enum(['all', 'today', 'older']),
  authToken: z.string(),
});
export type DeleteLogsInput = z.infer<typeof DeleteLogsInputSchema>;

const DeleteLogsOutputSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number().optional(),
  error: z.string().optional(),
});
export type DeleteLogsOutput = z.infer<typeof DeleteLogsOutputSchema>;

export async function deleteActivityLogs(input: DeleteLogsInput): Promise<DeleteLogsOutput> {
  return deleteActivityLogsFlow(input);
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (numDeleted: number) => void, reject: (err: any) => void) {
    try {
        const snapshot = await query.limit(100).get();
    
        if (snapshot.size === 0) {
            resolve(0);
            return;
        }

        const batch = adminDb.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        const numDeleted = snapshot.size;

        if (numDeleted < 100) {
            resolve(numDeleted);
            return;
        }

        // Recurse on the next process tick, to avoid exploding the stack.
        process.nextTick(async () => {
            const nextBatchNumDeleted = await new Promise<number>((res, rej) => deleteQueryBatch(query, res, rej));
            resolve(numDeleted + nextBatchNumDeleted);
        });
    } catch(err) {
        reject(err);
    }
}

const deleteActivityLogsFlow = ai.defineFlow(
  {
    name: 'deleteActivityLogsFlow',
    inputSchema: DeleteLogsInputSchema,
    outputSchema: DeleteLogsOutputSchema,
  },
  async ({ filter, authToken }) => {
    try {
        // Verify user is an admin
        const decodedToken = await getAuth(adminApp).verifyIdToken(authToken);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== 'Admin') {
            throw new Error('Permission denied. User is not an admin.');
        }

        let query = adminDb.collection('activityLogs') as FirebaseFirestore.Query;
        
        if (filter === 'today' || filter === 'older') {
          const today = new Date();
          today.setHours(0,0,0,0);
          const todayStart = Timestamp.fromDate(today);

          if (filter === 'today') {
              query = query.where('timestamp', '>=', todayStart);
          } else { // 'older'
              query = query.where('timestamp', '<', todayStart);
          }
        }


        const deletedCount = await new Promise<number>((resolve, reject) => deleteQueryBatch(query, resolve, reject));
        
        return {
            success: true,
            deletedCount,
        };

    } catch (error: any) {
      console.error('Error during activity log deletion:', error);
      return {
        success: false,
        error: error.message || 'An unknown error occurred.',
      };
    }
  }
);
