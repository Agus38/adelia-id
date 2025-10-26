
'use client';

import { ChatInterface } from '@/components/ai/chat-interface';
import { usePageAccess } from '@/hooks/use-page-access';
import { Bot, Loader2 } from 'lucide-react';
import React from 'react';

export default function AiAssistantPage() {
  const { hasAccess, isLoading } = usePageAccess('nexus-ai');

  // While loading, show a spinner.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If access is denied, the hook will handle the redirect.
  // Rendering null here prevents the main component from rendering while the redirect is in progress.
  if (!hasAccess) {
    return null;
  }

  // Once loading is complete and access is granted, render the chat interface.
  return (
    <div className="flex flex-1 flex-col h-full p-0">
        <div className="h-full rounded-lg border bg-card shadow-sm">
            <ChatInterface />
        </div>
    </div>
  );
}
