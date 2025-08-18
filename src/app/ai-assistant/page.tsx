import { ChatInterface } from "./chat-interface";

export default function AiAssistantPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Asisten AI Nexus</h2>
      </div>
      <ChatInterface />
    </div>
  );
}
