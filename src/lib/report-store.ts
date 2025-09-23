
'use client';

import { collection, query, where, getDocs, setDoc, doc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, logActivity } from './firebase';
import type { User } from 'firebase/auth';

// The DailyReport interface now includes userId
export interface DailyReport {
  id: string; // Firestore document ID
  date: Date;
  shift: 'pagi' | 'sore';
  omsetBersih: number;
  totalSetor: number;
  createdBy: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
  details: {
    modalAwal: number;
    pajak: number;
    pemasukan: { name: string; value: number }[];
    pengeluaran: { name: string; value: number }[];
  };
}

const reportsCollection = collection(db, 'dailyReports');

// Helper to generate a consistent ID for Firestore documents
const generateReportId = (date: Date, shift: 'pagi' | 'sore', userId: string) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${userId}-${dateString}-${shift}`;
};


export const getReports = async (): Promise<DailyReport[]> => {
  try {
    const snapshot = await getDocs(reportsCollection);
    const reports = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            date: data.date.toDate(), // Convert Firestore Timestamp to JS Date
            createdAt: data.createdAt?.toDate() || new Date(),
        } as DailyReport;
    });
    return reports.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by most recent
  } catch (error) {
    console.error("Error fetching reports from Firestore:", error);
    return [];
  }
};


export const getReport = async (date: Date, shift: 'pagi' | 'sore', userId: string): Promise<DailyReport | null> => {
    if (!date || !shift || !userId) return null;
    try {
        const reportId = generateReportId(date, shift, userId);
        const reportDocRef = doc(db, 'dailyReports', reportId);
        const docSnap = await getDoc(reportDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                id: docSnap.id,
                date: data.date.toDate(),
                createdAt: data.createdAt?.toDate(),
            } as DailyReport;
        }
        return null;
    } catch (error) {
        console.error("Error fetching single report from Firestore:", error);
        return null;
    }
};


export const addOrUpdateReport = async (reportData: Omit<DailyReport, 'id' | 'createdAt'>) => {
    const reportId = generateReportId(reportData.date, reportData.shift, reportData.userId);
    const reportDocRef = doc(db, 'dailyReports', reportId);
    
    try {
        const isNewReport = !(await getDoc(reportDocRef)).exists();
        
        await setDoc(reportDocRef, {
            ...reportData,
            createdAt: serverTimestamp(),
        }, { merge: true }); // Use merge: true to update if it exists, or create if not.

        // Log the activity
        const action = isNewReport ? 'membuat laporan' : 'memperbarui laporan';
        await logActivity(action, 'Laporan Harian');

    } catch (error) {
        console.error("Error saving report to Firestore:", error);
        throw error; // re-throw to be caught by the calling function
    }
};

export const deleteReport = async (reportId: string) => {
    try {
        const reportDocRef = doc(db, 'dailyReports', reportId);
        await deleteDoc(reportDocRef);
        await logActivity('menghapus laporan', 'Laporan Harian');
    } catch(error) {
        console.error("Error deleting report from Firestore:", error);
        throw error;
    }
}
