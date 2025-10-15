
'use server';

/**
 * @fileOverview AI assistant for personal finance consultation, integrated into BudgetFlow.
 *
 * - financialAssistant - A function that calls the financial assistant flow.
 * - FinancialAssistantInput - The input type for the financialAssistant function.
 * - FinancialAssistantOutput - The return type for the financialAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { Transaction, Goal, Debt } from '@/lib/budgetflow-store';

// Define schemas for financial data structures
const TransactionSchema = z.object({
    id: z.string(),
    type: z.enum(['income', 'expense']),
    description: z.string(),
    amount: z.number(),
    category: z.string(),
    date: z.string().describe("The date of the transaction in ISO 8601 format."),
});

const GoalSchema = z.object({
    id: z.string(),
    name: z.string(),
    targetAmount: z.number(),
    currentAmount: z.number(),
});

const DebtSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['debt', 'receivable']),
    totalAmount: z.number(),
    paidAmount: z.number(),
});

// Define a schema for a single message in the chat history
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// Update the input schema to accept financial data
const FinancialAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  userName: z.string().describe("The current user's name."),
  financialData: z.object({
    transactions: z.array(TransactionSchema),
    goals: z.array(GoalSchema),
    debts: z.array(DebtSchema),
    summary: z.object({
        totalIncome: z.number(),
        totalExpenses: z.number(),
        netFlow: z.number(),
    }),
  }).describe('The user\'s financial data for the selected period.'),
});
export type FinancialAssistantInput = z.infer<typeof FinancialAssistantInputSchema>;

// The output remains a single string response
const FinancialAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type FinancialAssistantOutput = z.infer<typeof FinancialAssistantOutputSchema>;

// Helper function to stringify financial data for the prompt
const formatFinancialData = (data: FinancialAssistantInput['financialData']) => {
    const formatCurrency = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

    const transactions = data.transactions.slice(0, 20).map(t => 
        `- ${t.description} (${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}) on ${new Date(t.date).toLocaleDateString('id-ID')}`
    ).join('\n');

    const goals = data.goals.map(g => 
        `- ${g.name}: ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)} (${((g.currentAmount/g.targetAmount)*100).toFixed(0)}% tercapai)`
    ).join('\n');

    const debts = data.debts.map(d => {
        const remaining = d.totalAmount - d.paidAmount;
        return `- ${d.name} (${d.type === 'debt' ? 'Hutang' : 'Piutang'}): Sisa ${formatCurrency(remaining)}`;
    }).join('\n');

    return `
--- DATA KEUANGAN PENGGUNA ---
Ringkasan Periode:
- Total Pemasukan: ${formatCurrency(data.summary.totalIncome)}
- Total Pengeluaran: ${formatCurrency(data.summary.totalExpenses)}
- Arus Kas Bersih: ${formatCurrency(data.summary.netFlow)}

Transaksi Terbaru (maks 20):
${transactions || 'Tidak ada transaksi.'}

Target Tabungan:
${goals || 'Tidak ada target.'}

Hutang/Piutang:
${debts || 'Tidak ada catatan.'}
-----------------------------
`;
};


export async function financialAssistant(input: FinancialAssistantInput): Promise<FinancialAssistantOutput> {
  const { history, financialData, userName } = input;

  const systemPrompt = `Kamu adalah seorang konsultan keuangan pribadi yang ramah, bijaksana, dan suportif. Kamu sedang berbicara dengan pengguna bernama "${userName}".
Tujuan utamamu adalah membantu pengguna menganalisis data keuangan mereka, memberikan wawasan, dan menjawab pertanyaan terkait kebiasaan belanja, tabungan, dan kesehatan finansial secara umum.

Selalu gunakan data keuangan yang disediakan di bawah ini sebagai dasar analisis dan jawabanmu. Jangan mengarang data.
Berikan jawaban yang jelas, ringkas, dan mudah dipahami. Gunakan poin-poin atau daftar jika perlu.
Berikan saran yang praktis dan dapat ditindaklanjuti.
Jika data tidak cukup untuk menjawab, katakan terus terang dan sarankan pengguna untuk mencatat lebih banyak transaksi.

${formatFinancialData(financialData)}

Gunakan riwayat percakapan untuk memahami konteks pertanyaan terbaru pengguna.
Mulai percakapan pertama dengan sapaan hangat dan tanyakan apa yang bisa kamu bantu analisis hari ini.`;
  
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: systemPrompt,
    history: history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
    prompt: history.length > 0 ? history[history.length - 1].content : "Sapa pengguna dan tawarkan bantuan.",
  });

  return { response: response.text };
}
