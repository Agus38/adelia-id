
'use server';

/**
 * @fileOverview A flow to reset all BudgetFlow data for the currently logged-in user.
 * 
 * - resetBudgetflowData - A server action that triggers the data deletion flow.
 * - ResetBudgetflowOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Define the output schema for the flow
const ResetBudgetflowOutputSchema = z.object({
  success: z.boolean(),
  deletedCollections: z.array(z.string()),
  error: z.string().optional(),
});
export type ResetBudgetflowOutput = z.infer<typeof ResetBudgetflowOutputSchema>;

let adminApp: App;
if (!getApps().some(app => app.name === 'budgetflow-reset')) {
  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG
      ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
      : null;

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'aeromenu',
      }, 'budgetflow-reset');
    } else {
      // Fallback for environments where ADC is available (like App Hosting)
      adminApp = initializeApp({ projectId: 'aeromenu' }, 'budgetflow-reset');
    }
  } catch (e: any) {
    console.error("Firebase Admin initialization failed:", e);
    // Provide a fallback if even the default init fails, though this is unlikely in a deployed env.
    if (!getApps().length) {
       adminApp = initializeApp({ projectId: 'aeromenu' });
    } else {
       adminApp = getApp();
    }
  }
} else {
  adminApp = getApps().find(app => app.name === 'budgetflow-reset')!;
}


const adminDb = getFirestore(adminApp);


// This is the exported function that client components will call.
export async function resetBudgetflowData(authToken?: string): Promise<ResetBudgetflowOutput> {
  return resetBudgetflowDataFlow(authToken);
}


async function deleteCollection(db: FirebaseFirestore.Firestore, collectionPath: string, batchSize: number): Promise<void> {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: () => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

// Define the Genkit flow
const resetBudgetflowDataFlow = ai.defineFlow(
  {
    name: 'resetBudgetflowDataFlow',
    inputSchema: z.string().optional(), // Auth token
    outputSchema: ResetBudgetflowOutputSchema,
  },
  async (authToken) => {
    let uid: string;
    try {
        if (!authToken) {
            throw new Error("Auth token is missing.");
        }
        const decodedToken = await getAuth(adminApp).verifyIdToken(authToken);
        uid = decodedToken.uid;
    } catch (authError: any) {
        console.error("Auth token verification failed:", authError);
        return { success: false, deletedCollections: [], error: 'Authentication failed. ' + authError.message };
    }

    if (!uid) {
        return { success: false, deletedCollections: [], error: 'User ID could not be determined.' };
    }

    const collectionsToDelete = ['transactions', 'goals', 'debts', 'categories'];
    const basePath = `budgetflow/${uid}`;

    try {
        for (const collectionName of collectionsToDelete) {
            const collectionPath = `${basePath}/${collectionName}`;
            await deleteCollection(adminDb, collectionPath, 100);
        }
        
        return {
            success: true,
            deletedCollections: collectionsToDelete,
        };

    } catch (error: any) {
      console.error('Error during BudgetFlow data reset:', error);
      return {
        success: false,
        deletedCollections: [],
        error: error.message || 'An unknown error occurred while deleting data.',
      };
    }
  }
);
