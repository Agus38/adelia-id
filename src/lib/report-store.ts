
'use client';

import type { DailyReport } from '@/components/admin/daily-report-management';

let reports: DailyReport[] = [
    {
        id: 'RPT-001',
        date: new Date('2024-07-23'),
        shift: 'pagi',
        omsetBersih: 5250000,
        totalSetor: 4850000,
        createdBy: 'Adelia',
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
    {
        id: 'RPT-003',
        date: new Date('2024-07-22'),
        shift: 'pagi',
        omsetBersih: 4800000,
        totalSetor: 4500000,
        createdBy: 'Adelia',
        details: {
            modalAwal: 500000,
            pajak: 480000,
            pemasukan: [
                 { name: 'GoFood', value: 1800000 },
                 { name: 'GrabFood', value: 1500000 },
            ],
            pengeluaran: [
                { name: 'Iuran Bulanan', value: 150000 },
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

export const addReport = (reportData: Omit<DailyReport, 'id'>) => {
  const newReport: DailyReport = {
    ...reportData,
    id: generateId(),
  };
  reports.push(newReport);
  listeners.notify();
};

export const deleteReport = (reportId: string) => {
  reports = reports.filter(r => r.id !== reportId);
  listeners.notify();
}
