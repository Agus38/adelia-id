
'use client';

import { collection, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface StockItem {
  id: number;
  name: string;
  morning: string;
  afternoon: string;
  order: string;
}

export interface StockReport {
  id: string; // Firestore document ID
  date: Date;
  shift: 'pagi' | 'sore';
  stockData: StockItem[];
  createdBy: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
}

export const initialStockData: StockItem[] = [
  { id: 1, name: 'Daging', morning: '', afternoon: '', order: '' },
  { id: 2, name: 'Babat', morning: '', afternoon: '', order: '' },
  { id: 3, name: 'Paru', morning: '', afternoon: '', order: '' },
  { id: 4, name: 'Usus', morning: '', afternoon: '', order: '' },
  { id: 5, name: 'Ati', morning: '', afternoon: '', order: '' },
  { id: 6, name: 'Otak', morning: '', afternoon: '', order: '' },
  { id: 7, name: 'Telur', morning: '', afternoon: '', order: '' },
  { id: 8, name: 'Kuah', morning: '', afternoon: '', order: '' },
  { id: 9, name: 'B-Goreng', morning: '', afternoon: '', order: '' },
  { id: 10, name: 'Seledri', morning: '', afternoon: '', order: '' },
  { id: 11, name: 'Garam', morning: '', afternoon: '', order: '' },
];


const stockReportsCollection = collection(db, 'stockReports');

const generateStockReportId = (date: Date, shift: 'pagi' | 'sore', userId: string) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${userId}-${dateString}-${shift}`;
};

export const getStockReport = async (date: Date, shift: 'pagi' | 'sore', userId: string): Promise<Pick<StockReport, 'stockData'> | null> => {
    if (!date || !shift || !userId) return null;
    try {
        const reportId = generateStockReportId(date, shift, userId);
        const reportDocRef = doc(db, 'stockReports', reportId);
        const docSnap = await getDoc(reportDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                stockData: data.stockData,
            } as Pick<StockReport, 'stockData'>;
        }
        return null;
    } catch (error) {
        console.error("Error fetching stock report from Firestore:", error);
        return null;
    }
};

export const addOrUpdateStockReport = async (reportData: Omit<StockReport, 'id' | 'createdAt'>) => {
    const reportId = generateStockReportId(reportData.date, reportData.shift, reportData.userId);
    const reportDocRef = doc(db, 'stockReports', reportId);
    
    try {
        await setDoc(reportDocRef, {
            ...reportData,
            createdAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error("Error saving stock report to Firestore:", error);
        throw error;
    }
};
