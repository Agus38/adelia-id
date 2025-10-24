
'use server';

/**
 * @fileOverview A tool for the Nexus AI assistant to report user issues to the admin panel.
 *
 * - reportIssue - The tool function that logs the issue to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ReportIssueInputSchema = z.object({
  userName: z.string().describe("The name of the user reporting the issue."),
  userAvatar: z.string().describe("The avatar URL of the user."),
  issueDescription: z.string().describe("A concise summary of the user's reported problem or complaint."),
});

export const reportIssue = ai.defineTool(
  {
    name: 'reportIssue',
    description: 'Use this tool to log a user-reported issue, complaint, or problem to the admin panel for review. Only use it when a user explicitly states a problem.',
    inputSchema: ReportIssueInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        userName: input.userName,
        userAvatar: input.userAvatar,
        action: 'melaporkan masalah',
        target: input.issueDescription.substring(0, 50), // Truncate for a brief target
        fullDescription: input.issueDescription,
        timestamp: serverTimestamp(),
        type: 'issue_report', // Differentiate this log type
      });
      return 'Laporan berhasil dicatat dan akan ditinjau oleh admin. Terima kasih atas masukan Anda!';
    } catch (error) {
      console.error('Failed to log issue:', error);
      return 'Gagal mencatat laporan. Mohon coba lagi nanti.';
    }
  }
);
