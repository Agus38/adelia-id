
'use client';

import { nexusAIAssistant } from '@/ai/flows/nexus-ai-assistant';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/user-store';
import { Bot, Send, User } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUserStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const result = await nexusAIAssistant({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    });
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-14rem)]">
      <CardHeader>
        <p className="text-muted-foreground">Mulai percakapan dengan Asisten AI Nexus.</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <Avatar>
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg p-3 max-w-[75%] ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <Avatar>
                 <AvatarImage src={user?.avatarUrl || user?.photoURL || undefined} alt={user?.fullName || "User"} data-ai-hint="user avatar" />
                 <AvatarFallback><User /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex items-start gap-4">
             <Avatar>
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
            <div className="rounded-lg p-3 bg-muted">
              <p className="text-sm">Mengetik...</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda..."
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
