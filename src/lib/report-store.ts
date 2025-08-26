
'use client';

import type { User } from 'firebase/auth';

// The DailyReport interface now includes userId
export interface DailyReport {
  id: string;
  date: Date;
  shift: 'pagi' | 'sore';
  omsetBersih: number;
  totalSetor: number;
  createdBy: string;
  userId: string; // Added user ID for ownership
  details: {
    modalAwal: number;
    pajak: number;
    pemasukan: { name: string; value: number }[];
    pengeluaran: { name: string; value: number }[];
  };
}

let reports: DailyReport[] = [
    {
        id: 'RPT-001',
        date: new Date('2024-07-23'),
        shift: 'pagi',
        omsetBersih: 5250000,
        totalSetor: 4850000,
        createdBy: 'Adelia',
        userId: 'user-adelia-id', // Example userId
        details: {
            modalAwal: 500000,
            pajak: 525000,
            pemasukan: [
                { name: 'GoFood', value: 1200000 },
                { name: 'GrabFood', value: 1100000 },
                { name: 'ShopeeFood', value: 950000 },
                { name: 'Qris Mandiri', value: 800000 },
            ],
            pengeluaran: [
                { name: 'Transport', value: 50000 },
                { name: 'Lembur', value: 150000 },
            ],
        },
    },
    {
        id: 'RPT-002',
        date: new Date('2024-07-23'),
        shift: 'sore',
        omsetBersih: 6100000,
        totalSetor: 5950000,
        createdBy: 'Budi',
        userId: 'user-budi-id', // Example userId
        details: {
            modalAwal: 1000000,
            pajak: 610000,
            pemasukan: [
                { name: 'GoFood', value: 2200000 },
                { name: 'GrabFood', value: 2100000 },
                { name: 'Qris Bri', value: 1000000 },
            ],
            pengeluaran: [
                 { name: 'Transport', value: 50000 },
            ],
        },
    },
];

type Listener = (data: DailyReport[]) => void;
let listener: Listener | null = null;

export const listeners = {
  subscribe: (newListener: Listener): (() => void) => {
    listener = newListener;
    return () => {
      listener = null;
    };
  },
  notify: () => {
    if (listener) {
      listener([...reports]);
    }
  },
};

const generateId = (): string => {
    const lastIdNumber = reports.reduce((maxId, report) => {
        const currentId = parseInt(report.id.split('-')[1], 10);
        return Math.max(maxId, currentId);
    }, 0);
    const newId = (lastIdNumber + 1).toString().padStart(3, '0');
    return `RPT-${newId}`;
}


export const getReports = (): DailyReport[] => {
  return reports;
};

// Function to find a specific report
export const getReport = (date: Date, shift: 'pagi' | 'sore', userId: string): DailyReport | undefined => {
    return reports.find(
        (r) =>
            r.date.toDateString() === date.toDateString() &&
            r.shift === shift &&
            r.userId === userId
    );
};


export const addOrUpdateReport = (reportData: Omit<DailyReport, 'id'>) => {
    const existingReportIndex = reports.findIndex(
        (r) =>
            r.date.toDateString() === reportData.date.toDateString() &&
            r.shift === reportData.shift &&
            r.userId === reportData.userId
    );

    if (existingReportIndex > -1) {
        // Update existing report
        reports[existingReportIndex] = {
            ...reports[existingReportIndex],
            ...reportData,
        };
    } else {
        // Add new report
        const newReport: DailyReport = {
            ...reportData,
            id: generateId(),
        };
        reports.push(newReport);
    }

    listeners.notify();
};

export const deleteReport = (reportId: string) => {
  reports = reports.filter(r => r.id !== reportId);
  listeners.notify();
}
