
'use client';

import { ChatInterface } from '@/components/ai/chat-interface';
import React from 'react';

export default function AiAssistantPage() {
  // The page access is already handled by the menu grid and layout.
  // Directly rendering the chat interface simplifies the logic and fixes the infinite loading state.
  // The ChatInterface component has its own internal loading handler for chat history.
  return (
    <div className="flex flex-1 flex-col h-full p-4 pt-6 md:p-8">
        <div className="h-full rounded-lg border bg-card shadow-sm">
            <ChatInterface />
        </div>
    </div>
  );
}
