'use client';

import * as React from 'react';
import { create } from 'zustand';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore } from './user-store';

// --- Types and Constants ---
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: Date | Timestamp;
  createdAt: any;
}

export interface Budget {
    id: string;
    userId: string;
    category: string;
    amount: number;
    createdAt: any;
}

export const incomeCategories = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya'];
export const expenseCategories = ['Makanan & Minuman', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Keluarga', 'Lainnya'];

// --- Zustand Store ---
interface BudgetflowState {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  error: Error | null;
  initializeListeners: (userId: string) => () => void;
}

export const useBudgetflowStore = create<BudgetflowState>((set) => ({
  transactions: [],
  budgets: [],
  loading: true,
  error: null,
  initializeListeners: (userId) => {
    set({ loading: true });

    const transactionsQuery = query(collection(db, 'budgetflow', userId, 'transactions'));
    const budgetsQuery = query(collection(db, 'budgetflow', userId, 'budgets'));

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      set(state => ({ transactions: transactionsData, loading: state.loading && false }));
    }, (error) => {
      console.error("Error fetching transactions:", error);
      set({ error, loading: false });
    });

    const unsubscribeBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      set(state => ({ budgets: budgetsData, loading: state.loading && false }));
    }, (error) => {
      console.error("Error fetching budgets:", error);
      set({ error, loading: false });
    });
    
    // Initial load might be fast, so ensure loading is false
    getDocs(transactionsQuery).then(() => getDocs(budgetsQuery)).then(() => {
        set({ loading: false });
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  },
}));

// --- Hook to connect component to the store ---
export const useBudgetflowData = () => {
    const { user } = useUserStore();
    const { initializeListeners } = useBudgetflowStore();

    React.useEffect(() => {
        if (user) {
            const unsubscribe = initializeListeners(user.uid);
            return () => unsubscribe();
        }
    }, [user, initializeListeners]);
    
    return useBudgetflowStore();
}

// --- API Functions ---
export const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const { userId, ...rest } = data;
    await addDoc(collection(db, 'budgetflow', userId, 'transactions'), {
        ...rest,
        createdAt: serverTimestamp(),
    });
};

export const updateTransaction = async (userId: string, transactionId: string, data: Partial<Omit<Transaction, 'id' | 'userId'>>) => {
    await updateDoc(doc(db, 'budgetflow', userId, 'transactions', transactionId), data);
};

export const deleteTransaction = async (transactionId: string) => {
    const userId = useUserStore.getState().user?.uid;
    if (!userId) throw new Error("User not authenticated");
    await deleteDoc(doc(db, 'budgetflow', userId, 'transactions', transactionId));
};

export const addBudget = async (data: Omit<Budget, 'id' | 'createdAt' | 'userId'>) => {
    const userId = useUserStore.getState().user?.uid;
    if (!userId) throw new Error("User not authenticated");
    await addDoc(collection(db, 'budgetflow', userId, 'budgets'), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
    });
};

export const updateBudget = async (budgetId: string, data: Partial<Omit<Budget, 'id' | 'userId'>>) => {
    const userId = useUserStore.getState().user?.uid;
    if (!userId) throw new Error("User not authenticated");
    await updateDoc(doc(db, 'budgetflow', userId, 'budgets', budgetId), data);
};

export const deleteBudget = async (budgetId: string) => {
    const userId = useUserStore.getState().user?.uid;
    if (!userId) throw new Error("User not authenticated");
    await deleteDoc(doc(db, 'budgetflow', userId, 'budgets', budgetId));
};
