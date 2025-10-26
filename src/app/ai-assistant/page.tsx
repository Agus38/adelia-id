
'use client';

import { ChatInterface } from '@/components/ai/chat-interface';
import { usePageAccess } from '@/hooks/use-page-access';
import { Bot, Loader2 } from 'lucide-react';

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
    return null; // The hook will handle the redirect.
  }

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
