
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DeveloperInfoSchema = z.object({
  name: z.string().describe("The developer's full name."),
  title: z.string().describe("The developer's professional title."),
  bio: z.string().describe("A short biography of the developer."),
});

export const getDeveloperInfo = ai.defineTool(
  {
    name: 'getDeveloperInfo',
    description: 'Use this tool to get information about the application\'s creator or developer.',
    inputSchema: z.object({}), // No input needed
    outputSchema: DeveloperInfoSchema,
  },
  async () => {
    try {
      const docRef = doc(db, 'app-settings', 'developer-info');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          name: data.name || 'No name available',
          title: data.title || 'No title available',
          bio: data.bio || 'No bio available',
        };
      } else {
        // Provide a default fallback if the document doesn't exist
        return {
          name: 'Agus Eka',
          title: 'Full-Stack Developer',
          bio: 'A passionate developer who loves building innovative solutions.',
        };
      }
    } catch (error) {
      console.error('Error fetching developer info:', error);
      // Provide a safe fallback in case of an error
      return {
        name: 'Agus Eka',
        title: 'Creator of this application',
        bio: 'There was an error fetching the full details, but he is the developer of this app.',
      };
    }
  }
);
