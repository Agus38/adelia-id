
'use server';

/**
 * @fileOverview A flow to sync products from the Digiflazz API.
 * 
 * - syncDigiflazzProducts - A server action that triggers the product sync flow.
 * - SyncDigiflazzOutput - The return type for the syncDigiflazzProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import md5 from 'md5';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Define the output schema for the flow
const SyncDigiflazzOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  productCount: z.number().optional(),
  error: z.string().optional(),
});
export type SyncDigiflazzOutput = z.infer<typeof SyncDigiflazzOutputSchema>;

// This is the exported function that client components will call.
export async function syncDigiflazzProducts(): Promise<SyncDigiflazzOutput> {
  return syncDigiflazzFlow();
}

// Define the Genkit flow
const syncDigiflazzFlow = ai.defineFlow(
  {
    name: 'syncDigiflazzFlow',
    outputSchema: SyncDigiflazzOutputSchema,
  },
  async () => {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;

    if (!username || !apiKey) {
      const errorMsg = 'Digiflazz username or API key is not configured in .env file.';
      console.error(errorMsg);
      return { success: false, message: 'Server configuration error.', error: errorMsg };
    }

    try {
      const signature = md5(`${username}${apiKey}pricelist`);

      const response = await fetch('https://api.digiflazz.com/v1/price-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: 'prepaid',
          username: username,
          sign: signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Digiflazz API request failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data)) {
        console.error('Unexpected response format from Digiflazz:', result);
        throw new Error('Failed to parse product list from Digiflazz.');
      }
      
      const products = result.data;
      
      // Save products to Firestore
      const batch = writeBatch(db);
      const productsCollection = collection(db, 'products');
      let productCount = 0;

      products.forEach((product: any) => {
        // We use buyer_sku_code as the document ID for easy lookup
        const productDocRef = doc(productsCollection, product.buyer_sku_code);
        batch.set(productDocRef, {
          ...product,
          syncedAt: new Date(),
        });
        productCount++;
      });
      
      await batch.commit();

      // Update sync status
      const syncStatusDocRef = doc(db, 'app-settings', 'digiflazzSyncStatus');
      await setDoc(syncStatusDocRef, {
        lastSync: new Date(),
        productCount: productCount,
      });

      return {
        success: true,
        message: `Successfully synced ${productCount} products.`,
        productCount: productCount,
      };

    } catch (error: any) {
      console.error('Error during Digiflazz sync:', error);
      return {
        success: false,
        message: 'An error occurred during synchronization.',
        error: error.message || 'Unknown error',
      };
    }
  }
);
