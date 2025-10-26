
'use server';

/**
 * @fileOverview A tool for the Nexus AI assistant to report user issues to the admin panel.
 *
 * - reportIssue - The tool function that logs the issue to Firestore using the Admin SDK.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, Timestamp, addDoc, collection } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK
// This ensures we use the server-side SDK for this server-side operation.
const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
  : undefined;

// Use a unique name for the admin app instance to avoid conflicts
const adminApp = getApps().find(app => app.name === 'issue-reporting') || initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: serviceAccount ? undefined : 'aeromenu',
}, 'issue-reporting');

const adminDb = getFirestore(adminApp);

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
      await addDoc(collection(adminDb, 'activityLogs'), {
        userName: input.userName,
        userAvatar: input.userAvatar,
        action: 'melaporkan masalah',
        target: input.issueDescription.substring(0, 50), // Truncate for a brief target
        fullDescription: input.issueDescription,
        timestamp: Timestamp.now(), // Use Admin SDK Timestamp
        type: 'issue_report', // Differentiate this log type
      });
      return 'Laporan berhasil dicatat dan akan ditinjau oleh admin. Terima kasih atas masukan Anda!';
    } catch (error) {
      console.error('Failed to log issue via Admin SDK:', error);
      return 'Gagal mencatat laporan. Mohon coba lagi nanti.';
    }
  }
);
