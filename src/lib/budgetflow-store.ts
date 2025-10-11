
'use client';

import * as React from 'react';
import { create } from 'zustand';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, serverTimestamp, Timestamp, getDocs, runTransaction } from 'firebase/firestore';
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

export interface Goal {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    createdAt: any;
}

export type DebtType = 'debt' | 'receivable';

export interface Debt {
    id: string;
    userId: string;
    name: string;
    type: DebtType;
    totalAmount: number;
    paidAmount: number;
    isPaid: boolean;
    dueDate?: Date | Timestamp;
    createdAt: any;
}


export interface Category {
    id: string;
    name: string;
    type: TransactionType;
}

export const defaultIncomeCategories: ComboboxOption[] = ['Gaji', 'Bonus', 'Investasi', 'Hadiah', 'Dari Tabungan', 'Lainnya'].map(c => ({ value: c, label: c }));
export const defaultExpenseCategories: ComboboxOption[] = ['Makanan & Minuman', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Keluarga', 'Tabungan', 'Bayar Hutang', 'Lainnya'].map(c => ({ value: c, label: c }));

// --- Zustand Store ---
interface BudgetflowState {
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  incomeCategories: ComboboxOption[];
  expenseCategories: ComboboxOption[];
  loading: boolean;
  error: Error | null;
  initializeListeners: (userId: string) => () => void;
}

export const useBudgetflowStore = create<BudgetflowState>((set) => ({
  transactions: [],
  goals: [],
  debts: [],
  incomeCategories: defaultIncomeCategories,
  expenseCategories: defaultExpenseCategories,
  loading: true,
  error: null,
  initializeListeners: (userId) => {
    set({ loading: true });

    const transactionsQuery = query(collection(db, 'budgetflow', userId, 'transactions'));
    const goalsQuery = query(collection(db, 'budgetflow', userId, 'goals'));
    const debtsQuery = query(collection(db, 'budgetflow', userId, 'debts'));
    const categoriesQuery = query(collection(db, 'budgetflow', userId, 'categories'));

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      set(state => ({ transactions: transactionsData }));
    }, (error) => {
      console.error("Error fetching transactions:", error);
      set({ error, loading: false });
    });

    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      set(state => ({ goals: goalsData }));
    }, (error) => {
      console.error("Error fetching goals:", error);
      set({ error, loading: false });
    });

     const unsubscribeDebts = onSnapshot(debtsQuery, (snapshot) => {
      const debtsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      set(state => ({ debts: debtsData }));
    }, (error) => {
      console.error("Error fetching debts:", error);
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
    
    Promise.all([getDocs(transactionsQuery), getDocs(goalsQuery), getDocs(debtsQuery), getDocs(categoriesQuery)]).then(() => {
        set({ loading: false });
    }).catch(error => {
        set({ loading: false, error });
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeDebts();
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
const getUserId = () => {
  const userId = useUserStore.getState().user?.uid;
  if (!userId) throw new Error("User not authenticated");
  return userId;
};

// Transactions
export const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const { userId, ...rest } = data;
    await addDoc(collection(db, 'budgetflow', userId, 'transactions'), { ...rest, createdAt: serverTimestamp() });
};
export const updateTransaction = async (userId: string, transactionId: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    await updateDoc(doc(db, 'budgetflow', userId, 'transactions', transactionId), { ...data });
};
export const deleteTransaction = async (transactionId: string) => {
    const userId = getUserId();
    await deleteDoc(doc(db, 'budgetflow', userId, 'transactions', transactionId));
};

// Goals (Savings)
export const addGoal = async (data: Omit<Goal, 'id' | 'createdAt' | 'userId'>) => {
    const userId = getUserId();
    await addDoc(collection(db, 'budgetflow', userId, 'goals'), { ...data, userId, createdAt: serverTimestamp() });
};
export const updateGoal = async (goalId: string, data: Partial<Omit<Goal, 'id' | 'userId'>>) => {
    const userId = getUserId();
    await updateDoc(doc(db, 'budgetflow', userId, 'goals', goalId), data);
};
export const deleteGoal = async (goalId: string) => {
    const userId = getUserId();
    await deleteDoc(doc(db, 'budgetflow', userId, 'goals', goalId));
};
export const adjustGoalAmount = async (goalId: string, amount: number, description: string) => {
    const userId = getUserId();
    const goalDocRef = doc(db, 'budgetflow', userId, 'goals', goalId);
    
    await runTransaction(db, async (transaction) => {
        const goalDoc = await transaction.get(goalDocRef);
        if (!goalDoc.exists()) throw new Error("Goal not found");

        const newCurrentAmount = goalDoc.data().currentAmount + amount;
        transaction.update(goalDocRef, { currentAmount: newCurrentAmount });

        // If adding money to savings, it's an 'expense' from your available cash.
        // If taking money from savings, it's an 'income' to your available cash.
        const transactionType = amount > 0 ? 'expense' : 'income';
        const transactionDescription = amount > 0 ? `Menabung untuk "${description}"` : `Ambil dari tabungan "${description}"`;
        const category = amount > 0 ? 'Tabungan' : 'Dari Tabungan';
        
        const transactionData = {
            userId,
            type: transactionType,
            description: transactionDescription,
            amount: Math.abs(amount),
            category: category,
            date: new Date(),
            createdAt: serverTimestamp(),
        };
        const newTransactionRef = doc(collection(db, 'budgetflow', userId, 'transactions'));
        transaction.set(newTransactionRef, transactionData);
    });
};

// Debts / Receivables
export const addDebt = async (data: Omit<Debt, 'id' | 'createdAt' | 'userId'>) => {
    const userId = getUserId();
    await addDoc(collection(db, 'budgetflow', userId, 'debts'), { ...data, userId, createdAt: serverTimestamp() });
};
export const updateDebt = async (debtId: string, data: Partial<Omit<Debt, 'id' | 'userId'>>) => {
    const userId = getUserId();
    await updateDoc(doc(db, 'budgetflow', userId, 'debts', debtId), data);
};
export const deleteDebt = async (debtId: string) => {
    const userId = getUserId();
    await deleteDoc(doc(db, 'budgetflow', userId, 'debts', debtId));
};
export const recordDebtPayment = async (debtId: string, amount: number, description: string) => {
    const userId = getUserId();
    const debtDocRef = doc(db, 'budgetflow', userId, 'debts', debtId);
    
    await runTransaction(db, async (transaction) => {
        const debtDoc = await transaction.get(debtDocRef);
        if (!debtDoc.exists()) throw new Error("Debt/Receivable not found");

        const debtData = debtDoc.data() as Debt;
        const newPaidAmount = debtData.paidAmount + amount;
        const isPaid = newPaidAmount >= debtData.totalAmount;
        transaction.update(debtDocRef, { paidAmount: newPaidAmount, isPaid });

        // Paying off your debt is an 'expense'. Receiving payment for a receivable is an 'income'.
        const transactionType = debtData.type === 'debt' ? 'expense' : 'income';
        const transactionDescription = debtData.type === 'debt' ? `Bayar hutang: ${description}` : `Terima piutang: ${description}`;
        const category = debtData.type === 'debt' ? 'Bayar Hutang' : 'Piutang';

        const transactionData = {
            userId,
            type: transactionType,
            description: transactionDescription,
            amount: amount,
            category: category,
            date: new Date(),
            createdAt: serverTimestamp(),
        };
        const newTransactionRef = doc(collection(db, 'budgetflow', userId, 'transactions'));
        transaction.set(newTransactionRef, transactionData);
    });
};


// Categories
export const addCategory = async (userId: string, name: string, type: TransactionType) => {
    if (!userId || !name.trim()) return;
    await addDoc(collection(db, 'budgetflow', userId, 'categories'), {
        name: name.trim(),
        type,
        createdAt: serverTimestamp(),
    });
};
