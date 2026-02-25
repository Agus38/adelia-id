
'use client';

import { collection, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './user-store';

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
        const isNewReport = !(await getDoc(reportDocRef)).exists();
        
        // Construct the data object explicitly to ensure correctness.
        const dataToSave = {
            date: reportData.date,
            formData: reportData.formData,
            createdBy: reportData.createdBy,
            userId: reportData.userId,
            createdAt: serverTimestamp(),
        };

        await setDoc(reportDocRef, dataToSave);
        
        // Log the activity
        const action = isNewReport ? 'membuat laporan' : 'memperbarui laporan';
        await logActivity(action, 'SMW Manyar');

    } catch (error) {
        console.error("Error saving SMW report to Firestore:", error);
        throw error;
    }
};
