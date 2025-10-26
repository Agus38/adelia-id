
'use client';

import { nexusAssistant } from '@/ai/flows/nexus-ai-assistant';
import type { AssistantInput } from '@/ai/flows/nexus-ai-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/user-store';
import { Bot, Send, User, Sparkles, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const promptSuggestions = [
    "Apa yang bisa kamu lakukan?",
    "Jelaskan tentang fitur BudgetFlow",
    "Siapa yang membuat aplikasi ini?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
        const savedMessages = sessionStorage.getItem('nexus-chat-history');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    } catch (error) {
        console.error("Failed to parse chat history from sessionStorage", error);
        sessionStorage.removeItem('nexus-chat-history');
    }
  }, []);

  useEffect(() => {
      if (messages.length > 0) {
          sessionStorage.setItem('nexus-chat-history', JSON.stringify(messages));
      } else {
          sessionStorage.removeItem('nexus-chat-history');
      }
  }, [messages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);


  const handlePromptSuggestionClick = (prompt: string) => {
      setInput(prompt);
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent, prompt);
  };

  const handleClearChat = () => {
      setMessages([]);
      sessionStorage.removeItem('nexus-chat-history');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, suggestedPrompt?: string) => {
    e.preventDefault();
    const currentInput = suggestedPrompt || input;
    if (!currentInput.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: currentInput };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    
    // Add an empty message for the model that will be populated
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const assistantInput: AssistantInput = {
        history: newMessages, // Send history up to the user's message
        appContext: {
          userName: user?.fullName || 'Pengguna',
          userAvatar: user?.avatarUrl || user?.photoURL || undefined,
          userRole: user?.role || 'Pengguna',
        },
      };

      const stream = await nexusAssistant(assistantInput);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model') {
              lastMessage.content += chunk;
              return [...prev.slice(0, -1), lastMessage];
            }
            // This case should ideally not happen if we've added the empty message
            return [...prev, { role: 'model', content: chunk }];
          });
        }
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setError('Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.');
       setMessages(prev => prev.slice(0, -1)); // Remove the empty model message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card rounded-lg">
      <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
              <div className="relative">
                 <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                 <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
              <div>
                  <p className="font-semibold">Nexus AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Online</p>
              </div>
          </div>
          {messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                    <Trash2 className="h-4 w-4 text-muted-foreground"/>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Riwayat Percakapan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Seluruh percakapan Anda dengan asisten AI akan dihapus.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>Ya, Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
             <div className="text-center text-muted-foreground space-y-8 animate-in fade-in duration-500 pt-8">
                <div className="flex justify-center">
                    <div className="p-5 bg-primary/10 rounded-full w-fit shadow-inner">
                        <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-xl text-foreground">Halo, {user?.fullName || 'Sobat'}!</p>
                    <p className="text-sm">Saya asisten AI Anda. Apa yang bisa saya bantu hari ini?</p>
                </div>
                 <div className="flex flex-wrap justify-center gap-2 px-4">
                    {promptSuggestions.map((prompt, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handlePromptSuggestionClick(prompt)}>
                            {prompt}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
               {msg.role === 'model' ? (
                    <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
               ) : (
                <>
                   <AvatarImage src={user?.avatarUrl || user?.photoURL || undefined} alt={user?.fullName || "User"} data-ai-hint="user avatar" />
                   <AvatarFallback><User className="w-4 h-4"/></AvatarFallback>
                </>
               )}
            </Avatar>
            
            <div className={`rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted rounded-bl-none'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-full leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {isLoading && msg.role === 'model' && index === messages.length - 1 && (
                     <span className="inline-block h-4 w-1 animate-pulse bg-foreground ml-1" />
                  )}
              </div>
            </div>
          </div>
        ))}
        
        {error && (
             <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-destructive/20 text-destructive"><Bot className="w-5 h-5"/></AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-3 bg-destructive/10 text-sm text-destructive flex items-center gap-2 rounded-bl-none">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            </div>
        )}
         <div ref={messagesEndRef} />
      </main>

      <footer className="border-t p-2 sm:p-4 flex-shrink-0">
        <form ref={formRef} onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </footer>
    </div>
  );
}
