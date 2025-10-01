
'use client';

import { nexusAIAssistant } from '@/ai/flows/nexus-ai-assistant';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/user-store';
import { Bot, Send, User, Sparkles, Trash2, Loader2, AudioLines } from 'lucide-react';
import { useRef, useState, useTransition, useEffect } from 'react';
import { useAboutInfoConfig, useDeveloperInfoConfig, useMenuConfig } from '@/lib/menu-store';
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
    "Apa saja fitur di aplikasi ini?",
    "Siapa yang membuat aplikasi ini?",
    "Bagaimana cara mengubah profil saya?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // message content being played

  // Fetching app context
  const { aboutInfo } = useAboutInfoConfig();
  const { developerInfo } = useDeveloperInfoConfig();
  const { menuItems } = useMenuConfig();

  // Load chat from localStorage on initial render
  useEffect(() => {
    try {
        const savedMessages = localStorage.getItem('nexus-chat-history');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        localStorage.removeItem('nexus-chat-history');
    }
  }, []);

  // Save chat to localStorage whenever it changes
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('nexus-chat-history', JSON.stringify(messages));
      } else {
          localStorage.removeItem('nexus-chat-history');
      }
  }, [messages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const handlePlayAudio = async (text: string) => {
    if (isPlaying === text) { // If it's already playing this text
        audioRef.current?.pause();
        setIsPlaying(null);
        setAudioUrl(null);
        return;
    }

    setIsPlaying(text); // Show loading state
    setAudioUrl(null);
    try {
        const result = await textToSpeech({ text });
        setAudioUrl(result.audioDataUri);
    } catch(error) {
        console.error("TTS Error:", error);
        setIsPlaying(null);
    }
  }

  useEffect(() => {
    if(audioUrl && audioRef.current) {
        audioRef.current.play();
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
      setIsPlaying(null);
      setAudioUrl(null);
  }

  const handlePromptSuggestionClick = (prompt: string) => {
      setInput(prompt);
      // Automatically submit the form
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent, prompt);
  };

  const handleClearChat = () => {
      setMessages([]);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, suggestedPrompt?: string) => {
    e.preventDefault();
    const currentInput = suggestedPrompt || input;
    if (!currentInput.trim()) return;

    const userMessage: Message = { role: 'user', content: currentInput };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');

    startTransition(async () => {
      const appContext = {
          appName: aboutInfo.appName,
          appVersion: aboutInfo.version,
          appDescription: aboutInfo.description,
          features: menuItems.map(item => item.title),
          developerName: developerInfo.name,
          developerTitle: developerInfo.title,
      };
      
      const result = await nexusAIAssistant({ history: newHistory, appContext });
      const assistantMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    });
  };

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className='flex-row justify-between items-center'>
        <p className="text-muted-foreground">Mulai percakapan dengan Asisten AI Nexus.</p>
        {messages.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-2"/>
                Bersihkan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Riwayat Percakapan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Seluruh percakapan Anda dengan Nexus akan dihapus secara permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat}>
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isPending && (
             <div className="text-center text-muted-foreground space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full w-fit">
                        <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-lg text-foreground">Hai! Aku Nexus, sahabat AI-mu!</p>
                    <p className="text-sm">Ada yang bisa aku bantu? Tanya aja soal aplikasi ini, atau coba salah satu pertanyaan di bawah!</p>
                </div>
                 <div className="flex flex-wrap justify-center gap-2">
                    {promptSuggestions.map((prompt, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handlePromptSuggestionClick(prompt)}>
                            {prompt}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <Avatar>
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
            )}
            <div className={`rounded-lg p-3 max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-full leading-relaxed">
                  <ReactMarkdown
                      components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                          li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      }}
                  >
                      {msg.content}
                  </ReactMarkdown>
              </div>

              {msg.role === 'model' && msg.content && (
                  <div className="mt-2 pt-2 border-t border-muted-foreground/20 flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePlayAudio(msg.content)} disabled={isPending || (isPlaying !== null && isPlaying !== msg.content)}>
                        {isPlaying === msg.content ? <Loader2 className="h-4 w-4 animate-spin"/> : <AudioLines className="h-4 w-4"/>}
                        <span className="sr-only">Dengarkan</span>
                     </Button>
                     {isPlaying === msg.content && audioUrl && (
                        <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="h-8" controls />
                     )}
                  </div>
              )}
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
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
             <Avatar>
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
            <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Mengetik...</p>
            </div>
          </div>
        )}
         <div ref={messagesEndRef} />
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
