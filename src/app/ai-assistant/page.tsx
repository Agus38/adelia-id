
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
    <div className="flex flex-1 flex-col p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-2">
        <Bot className="h-8 w-8" />
        <h2 className="text-3xl font-bold tracking-tight">Nexus AI Assistant</h2>
      </div>
      <p className="text-muted-foreground mt-2">
        Ajukan pertanyaan, minta bantuan, atau laporkan masalah. Asisten AI kami siap membantu.
      </p>
      <div className="mt-6 flex-1">
        <div className="h-[calc(100vh-16rem)] rounded-lg border bg-card shadow-sm">
            <ChatInterface />
        </div>
      </div>
    </div>
  );
}
