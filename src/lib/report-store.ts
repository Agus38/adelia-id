
'use client';

import { type DailyReport, type ReportStatus } from '@/components/admin/daily-report-management';

type NewReport = Omit<DailyReport, 'id'>;

let reports: DailyReport[] = [
    {
        id: 'RPT-001',
        date: new Date('2024-07-23'),
        shift: 'pagi',
        omsetBersih: 5250000,
        totalSetor: 4850000,
        createdBy: 'Adelia',
        status: 'approved',
    },
    {
        id: 'RPT-002',
        date: new Date('2024-07-23'),
        shift: 'sore',
        omsetBersih: 6100000,
        totalSetor: 5950000,
        createdBy: 'Budi',
        status: 'pending',
    },
    {
        id: 'RPT-003',
        date: new Date('2024-07-22'),
        shift: 'pagi',
        omsetBersih: 4800000,
        totalSetor: 4500000,
        createdBy: 'Adelia',
        status: 'rejected',
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
    const lastId = reports.length > 0 ? parseInt(reports[reports.length - 1].id.split('-')[1], 10) : 0;
    const newId = (lastId + 1).toString().padStart(3, '0');
    return `RPT-${newId}`;
}


export const getReports = (): DailyReport[] => {
  return reports;
};

export const addReport = (reportData: NewReport) => {
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

export const updateReportStatus = (reportId: string, status: ReportStatus) => {
    reports = reports.map(r => r.id === reportId ? { ...r, status } : r);
    listeners.notify();
}
