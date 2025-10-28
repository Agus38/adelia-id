
'use client';

import { ChatInterface } from '@/components/ai/chat-interface';
import { usePageAccess } from '@/hooks/use-page-access';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default function AiAssistantPage() {
  const { hasAccess, isLoading } = usePageAccess('nexus-ai');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    // The usePageAccess hook handles redirection, so we can just return null.
    return null;
  }

  return (
    <div className="flex flex-1 flex-col h-full">
        <ChatInterface />
    </div>
  );
}
