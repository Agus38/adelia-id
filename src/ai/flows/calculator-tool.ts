'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const calculateExpression = ai.defineTool(
  {
    name: 'calculateExpression',
    description: 'Calculate a mathematical expression. Supports addition (+), subtraction (-), multiplication (*), and division (/).',
    inputSchema: z.object({
      expression: z.string().describe('The mathematical expression to evaluate, e.g., "10 + 5 * (3 - 1)"'),
    }),
    outputSchema: z.string().describe('The result of the calculation.'),
  },
  async (input) => {
    try {
      // Basic safety: only allow numbers, operators, and parentheses.
      const safeExpression = input.expression.replace(/[^-()\d/*+.]/g, '');
      const result = eval(safeExpression);
      return `Hasil dari ${input.expression} adalah ${result}.`;
    } catch (error) {
      console.error('Calculator tool error:', error);
      return 'Maaf, saya tidak dapat menghitung ekspresi tersebut. Pastikan formatnya benar.';
    }
  }
);
