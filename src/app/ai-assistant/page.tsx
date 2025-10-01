
'use client';

import { ChatInterface } from "./chat-interface";
import { usePageAccess } from "@/hooks/use-page-access";
import { Loader2 } from "lucide-react";

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
    return null; // The hook handles redirection.
  }

  return (
    <div className="flex flex-col flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between space-y-2 flex-shrink-0">
        <h2 className="text-3xl font-bold tracking-tight">Asisten AI Nexus</h2>
      </div>
      <ChatInterface />
    </div>
  );
}
