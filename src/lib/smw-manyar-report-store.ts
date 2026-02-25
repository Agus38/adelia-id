
'use client';

import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { logActivity } from './user-store';

export interface SmwReport {
  id: string; // Firestore document ID
  date: Date;
  createdBy: string;
  createdAt: any; // Firestore Timestamp
  formData: { [key: string]: string };
}

const reportsCollection = collection(db, 'smwManyarReports');

export const getSmwReports = async (): Promise<SmwReport[]> => {
  try {
    const snapshot = await getDocs(reportsCollection);
    const reports = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            date: data.date.toDate(), 
            createdAt: data.createdAt?.toDate() || new Date(),
        } as SmwReport;
    });
    return reports.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching SMW reports from Firestore:", error);
    return [];
  }
};

export const deleteSmwReport = async (reportId: string) => {
    try {
        const reportDocRef = doc(db, 'smwManyarReports', reportId);
        await deleteDoc(reportDocRef);
        await logActivity('menghapus laporan', 'SMW Manyar');
    } catch(error) {
        console.error("Error deleting SMW report from Firestore:", error);
        throw error;
    }
}
