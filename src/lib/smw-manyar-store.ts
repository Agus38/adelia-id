
'use client';

import { collection, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SmwReportData {
  id: string; // Firestore document ID
  date: Date;
  formData: { [key: string]: string };
  createdBy: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
}

const smwReportsCollection = collection(db, 'smwManyarReports');

const generateReportId = (date: Date, userId: string) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${userId}-${dateString}`;
};

export const getSmwReport = async (date: Date, userId: string): Promise<{ formData: { [key: string]: string } } | null> => {
    if (!date || !userId) return null;
    try {
        const reportId = generateReportId(date, userId);
        const reportDocRef = doc(db, 'smwManyarReports', reportId);
        const docSnap = await getDoc(reportDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                formData: data.formData,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching SMW report from Firestore:", error);
        return null;
    }
};

export const addOrUpdateSmwReport = async (reportData: Omit<SmwReportData, 'id' | 'createdAt'>) => {
    const reportId = generateReportId(reportData.date, reportData.userId);
    const reportDocRef = doc(db, 'smwManyarReports', reportId);
    
    try {
        // Explicitly construct the object to be saved to Firestore
        // to avoid any issues with spreading objects that might contain
        // incompatible types or structures from the client-side.
        const dataToSave = {
            date: reportData.date,
            formData: reportData.formData,
            createdBy: reportData.createdBy,
            userId: reportData.userId,
            createdAt: serverTimestamp(), // Use server timestamp for consistency
        };

        await setDoc(reportDocRef, dataToSave, { merge: true });
    } catch (error) {
        console.error("Error saving SMW report to Firestore:", error);
        throw error;
    }
};
