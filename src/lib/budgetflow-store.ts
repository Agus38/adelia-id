
'use client';

import * as React from 'react';
import { create } from 'zustand';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore } from './user-store';
import type { ComboboxOption } from '@/components/ui/combobox';

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

export interface Category {
    id: string;
    name: string;
    type: TransactionType;
}

export const defaultIncomeCategories: ComboboxOption[] = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya'].map(c => ({ value: c, label: c }));
export const defaultExpenseCategories: ComboboxOption[] = ['Makanan & Minuman', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Keluarga', 'Lainnya'].map(c => ({ value: c, label: c }));

// --- Zustand Store ---
interface BudgetflowState {
  transactions: Transaction[];
  budgets: Budget[];
  incomeCategories: ComboboxOption[];
  expenseCategories: ComboboxOption[];
  loading: boolean;
  error: Error | null;
  initializeListeners: (userId: string) => () => void;
}

export const useBudgetflowStore = create<BudgetflowState>((set) => ({
  transactions: [],
  budgets: [],
  incomeCategories: defaultIncomeCategories,
  expenseCategories: defaultExpenseCategories,
  loading: true,
  error: null,
  initializeListeners: (userId) => {
    set({ loading: true });

    const transactionsQuery = query(collection(db, 'budgetflow', userId, 'transactions'));
    const budgetsQuery = query(collection(db, 'budgetflow', userId, 'budgets'));
    const categoriesQuery = query(collection(db, 'budgetflow', userId, 'categories'));

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      set(state => ({ transactions: transactionsData }));
    }, (error) => {
      console.error("Error fetching transactions:", error);
      set({ error, loading: false });
    });

    const unsubscribeBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      set(state => ({ budgets: budgetsData }));
    }, (error) => {
      console.error("Error fetching budgets:", error);
      set({ error, loading: false });
    });
    
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const customIncome: ComboboxOption[] = [];
      const customExpense: ComboboxOption[] = [];
      snapshot.docs.forEach(doc => {
          const category = doc.data() as Omit<Category, 'id'>;
          if (category.type === 'income') {
              customIncome.push({ value: category.name, label: category.name });
          } else {
              customExpense.push({ value: category.name, label: category.name });
          }
      });

      const combinedIncome = [...defaultIncomeCategories, ...customIncome].filter((v,i,a)=>a.findIndex(t=>(t.value === v.value))===i);
      const combinedExpense = [...defaultExpenseCategories, ...customExpense].filter((v,i,a)=>a.findIndex(t=>(t.value === v.value))===i);
      
      set({ 
          incomeCategories: combinedIncome.sort((a,b) => a.label.localeCompare(b.label)), 
          expenseCategories: combinedExpense.sort((a,b) => a.label.localeCompare(b.label)),
      });

    }, (error) => {
      console.error("Error fetching categories:", error);
      set({ error, loading: false });
    });
    
    // Initial load might be fast, so ensure loading is false
    Promise.all([getDocs(transactionsQuery), getDocs(budgetsQuery), getDocs(categoriesQuery)]).then(() => {
        set({ loading: false });
    }).catch(error => {
        set({ loading: false, error });
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeCategories();
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

export const updateTransaction = async (userId: string, transactionId: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    await updateDoc(doc(db, 'budgetflow', userId, 'transactions', transactionId), {
        ...data,
    });
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

export const addCategory = async (userId: string, name: string, type: TransactionType) => {
    if (!userId || !name.trim()) return;
    await addDoc(collection(db, 'budgetflow', userId, 'categories'), {
        name: name.trim(),
        type,
        createdAt: serverTimestamp(),
    });
};
