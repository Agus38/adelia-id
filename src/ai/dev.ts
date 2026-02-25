'use server';

import '@/ai/flows/sync-digiflazz-products.ts';
import '@/ai/flows/financial-assistant.ts';
import '@/ai/flows/text-enhancer.ts';
import '@/ai/flows/delete-activity-logs.ts';
// Import the new flow file so Genkit can recognize it.
import '@/ai/flows/nexus-ai-assistant.ts';
// Import the new tool file
import '@/ai/flows/get-developer-info-tool.ts';
// Import the new time tool
import '@/ai/flows/get-current-time-tool.ts';
// Import new tools
import '@/ai/flows/get-weather-forecast-tool.ts';
import '@/ai/flows/google-search-tool.ts';
import '@/ai/flows/get-stock-price-tool.ts';
import '@/ai/flows/calculator-tool.ts';
import '@/ai/flows/currency-converter-tool.ts';
