
'use client';

import { ChatInterface } from "./chat-interface";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function AiAssistantSkeleton() {
    return (
        <div className="flex flex-col flex-1 p-2 sm:p-4 md:p-6">
            <div className="flex-shrink-0 mb-4 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="w-full flex-1 rounded-2xl" />
        </div>
    );
}

export default function AiAssistantPage() {
  const { hasAccess, isLoading } = usePageAccess('nexus-ai');

  if (isLoading) {
    return <AiAssistantSkeleton />;
  }

  if (!hasAccess) {
    return null; // The hook handles redirection.
  }

  return (
    <div className="flex flex-col flex-1 p-2 sm:p-4 md:p-6">
      <div className="flex-shrink-0 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
             <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Asisten AI Nexus</h2>
            <p className="text-sm text-muted-foreground">Tanyakan apa saja seputar aplikasi ini.</p>
          </div>
        </div>
      </div>
      <ChatInterface />
    </div>
  );
}
