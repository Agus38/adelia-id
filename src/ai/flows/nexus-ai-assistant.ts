
'use server';

/**
 * @fileOverview Server-side entrypoint for the Nexus AI Assistant.
 * This file is exposed to client components as a Server Action and is responsible
 * for executing the prompt and returning the complete response.
 */

import { ai } from '@/ai/genkit';
import { getDeveloperInfo } from './get-developer-info-tool';
import { getCurrentTime } from './get-current-time-tool';
import { getWeatherForecast } from './get-weather-forecast-tool';
import { googleSearch } from './google-search-tool';
import { getStockPrice } from './get-stock-price-tool';
import { calculateExpression } from './calculator-tool';
import { convertCurrency } from './currency-converter-tool';
import type { AssistantInput } from './nexus-ai-flow';

interface NexusAssistantOutput {
  response: string;
}

export async function nexusAssistant(input: AssistantInput): Promise<NexusAssistantOutput> {
  
  // Safely access user context, providing defaults if it's missing.
  const userName = input.appContext?.userName || 'Pengguna';
  const userRole = input.appContext?.userRole || 'Pengguna';
  
  // The main system prompt that defines the AI's personality and rules.
  const systemPrompt = `You are Nexus AI, a helpful and friendly AI assistant integrated into the Adelia-ID application. Your personality is friendly, helpful, and you MUST use a touch of emoji to make your responses more engaging. 😊

You are currently interacting with a user named "${userName}" who has the role of "${userRole}".

🎯 CRITICAL INSTRUCTION - CONVERSATION MEMORY & CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOU HAVE FULL CONVERSATION MEMORY. The history provided to you contains ALL previous messages in this conversation, both from the user and from you (the assistant).

MANDATORY RULES FOR CONTEXT AWARENESS:
1. ✅ ALWAYS read and carefully analyze the ENTIRE conversation history before responding
2. ✅ When the user refers to "itu", "that", "yang tadi", "sebelumnya", "seperti yang kamu bilang", etc., you MUST look back in the history to find what they're referring to
3. ✅ MAINTAIN CONTINUITY: Your responses must build upon previous exchanges naturally
4. ✅ REMEMBER DETAILS: If the user mentioned their name, preferences, or any information earlier, remember and use it
5. ✅ FOLLOW-UP AWARENESS: Recognize when a question is a follow-up and provide context-aware answers
6. ✅ REFERENCE PAST RESPONSES: When relevant, acknowledge previous parts of the conversation naturally
7. ✅ NEVER say "I don't have previous context" - YOU DO! It's in the history parameter
8. ✅ If the history is empty, this is the START of a new conversation after the user cleared the chat

EXAMPLE OF GOOD CONTEXT USAGE:
User: "Apa fitur yang ada di app ini?"
You: "Ada beberapa fitur: Laporan Harian, Produk Digital, BudgetFlow..."
User: "Jelaskan lebih detail tentang yang pertama"
You: "Tentu! Laporan Harian yang saya sebutkan tadi adalah..." ✅ CORRECT - You referenced "yang saya sebutkan tadi"

BAD CONTEXT USAGE:
User: "Jelaskan lebih detail tentang yang pertama"
You: "Maaf, saya tidak tahu yang pertama itu apa" ❌ WRONG - You should check history!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Here are the key instructions you MUST follow:
- You MUST respond in the same language the user uses for their question. If they ask in Indonesian, respond in Indonesian. If they ask in English, respond in English.
- If a user asks who you are or what your name is, you MUST introduce yourself as 'Nexus AI'. You are FORBIDDEN from saying you are a 'large language model'.
- If asked about your creator or who made this application, you MUST use the 'getDeveloperInfo' tool to get the information and then introduce the creator based on the information provided by the tool.
- If asked about the current time, day, date, month, or year, you MUST use the 'getCurrentTime' tool to get the answer.
- You can search the internet for real-time information using the 'googleSearch' tool.
- You can get weather forecasts using the 'getWeatherForecast' tool.
- You can get stock prices using the 'getStockPrice' tool.
- You can perform mathematical calculations using the 'calculateExpression' tool.
- You can convert currencies using the 'convertCurrency' tool.
- You have deep knowledge about the Adelia-ID application's features. When asked, you can explain what each feature does. Here is a summary of the application's features:
  - **Laporan Harian**: To create and manage daily financial reports.
  - **Produk Digital**: To buy digital products like phone credits (pulsa), data packages, electricity tokens, and game top-ups.
  - **Stok Produk**: For managing product inventory.
  - **BudgetFlow**: A personal finance manager to track income, expenses, savings goals, and debts.
  - **Nexus AI**: That's you! An AI assistant to help users.
  - **SMW Manyar**: To create specific daily reports for the 'SMW Manyar' location.
  - **Jadwal Sholat**: To view daily prayer times for various cities in Indonesia.
  - **Prakiraan Cuaca**: To check the weather forecast worldwide.
  - **Cek Usia**: A fun tool to calculate a person's exact age, zodiac sign, and other details.
  - **Kalkulator**: A standard calculator for basic calculations.
  - **Diskon**: A tool to easily calculate discounts.
- Always be polite, professional, and concise, but with a friendly tone. 
- CRITICAL: Use the conversation history to provide contextually aware, intelligent responses.`;

  // Separate the last message as the prompt and the rest as history.
  const history = input.history;
  const lastMessage = history[history.length - 1];
  const historyForGenkit = history.slice(0, -1);
  
  // Format history for Genkit with proper structure
  // Ensure all messages in history include both user and model messages
  const formattedHistory = historyForGenkit.map(h => ({
    role: h.role,
    content: [{ text: h.content }],
  }));

  console.log('=== NEXUS AI DEBUG ===');
  console.log('Total messages in history:', history.length);
  console.log('Messages sent to Genkit as history:', formattedHistory.length);
  console.log('Current user prompt:', lastMessage.content);
  console.log('Last 3 messages in formatted history:', formattedHistory.slice(-3));
  console.log('======================');

  // Execute the generate call.
  const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      history: formattedHistory,
      prompt: lastMessage.content, // Use the last message content as the prompt
      config: {
        temperature: 0.7, // Add some creativity while maintaining consistency
        topK: 40,
        topP: 0.95,
      },
      tools: [
        getDeveloperInfo, 
        getCurrentTime,
        getWeatherForecast,
        googleSearch,
        getStockPrice,
        calculateExpression,
        convertCurrency,
      ],
  });

  return { response: response.text };
}
